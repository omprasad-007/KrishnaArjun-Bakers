from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models.models import Message, User, UserRole, Order
from app.schemas.schemas import MessageCreate, MessageOut, ConversationSummary
from app.utils.auth import get_current_user, require_admin
from app.services.websocket_manager import ws_manager
from app.services.notification_service import create_notification
import json

router = APIRouter(prefix="/chat", tags=["Real-time Chat"])

def get_conversation_id_for_customer(customer_id: int) -> str:
    return f"conv_user_{customer_id}"

@router.get("/conversations", response_model=List[ConversationSummary])
def get_conversations(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin view: list of all customer conversations with latest message & unread badge"""
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER.value).all()
    summaries = []

    for cust in customers:
        conv_id = get_conversation_id_for_customer(cust.id)
        last_msg = db.query(Message).filter(
            Message.conversation_id == conv_id
        ).order_by(Message.created_at.desc()).first()
        
        unread_count = db.query(Message).filter(
            Message.conversation_id == conv_id,
            Message.sender_id == cust.id,
            Message.is_read == False
        ).count()

        latest_order = db.query(Order).filter(Order.user_id == cust.id).order_by(Order.created_at.desc()).first()

        summaries.append(ConversationSummary(
            conversation_id=conv_id,
            customer_id=cust.id,
            customer_name=cust.name,
            customer_phone=cust.phone,
            last_message=last_msg.message if last_msg else None,
            last_message_time=last_msg.created_at if last_msg else None,
            unread_count=unread_count,
            latest_order_id=latest_order.id if latest_order else None,
            latest_order_number=latest_order.order_number if latest_order else None
        ))

    # Sort by recent message activity
    summaries.sort(key=lambda s: s.last_message_time or cust.created_at, reverse=True)
    return summaries

@router.get("/messages/{customer_id}", response_model=List[MessageOut])
def get_messages_for_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN.value and current_user.id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    
    conv_id = get_conversation_id_for_customer(customer_id)
    messages = db.query(Message).filter(
        Message.conversation_id == conv_id
    ).order_by(Message.created_at.asc()).all()

    # Mark unread messages as read
    if current_user.role == UserRole.ADMIN.value:
        db.query(Message).filter(
            Message.conversation_id == conv_id,
            Message.sender_id == customer_id,
            Message.is_read == False
        ).update({"is_read": True})
        db.commit()
    else:
        db.query(Message).filter(
            Message.conversation_id == conv_id,
            Message.sender_id != customer_id,
            Message.is_read == False
        ).update({"is_read": True})
        db.commit()

    return messages

@router.post("/messages/{customer_id}", response_model=MessageOut)
async def send_message_rest(
    customer_id: int,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN.value and current_user.id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    conv_id = get_conversation_id_for_customer(customer_id)
    receiver_id = customer_id if current_user.role == UserRole.ADMIN.value else None

    msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        order_id=msg_in.order_id,
        message=msg_in.message,
        message_type=msg_in.message_type,
        is_read=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Real-time WebSocket dispatch
    payload = {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "order_id": msg.order_id,
        "message": msg.message,
        "message_type": msg.message_type,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat()
    }
    
    if current_user.role == UserRole.ADMIN.value:
        await ws_manager.send_personal_message({"type": "CHAT_MESSAGE", "payload": payload}, customer_id)
        create_notification(
            db=db,
            user_id=customer_id,
            title="New Message from KrishnaArjun Bakers",
            message=msg.message[:80],
            notif_type="CHAT"
        )
    else:
        await ws_manager.broadcast_to_admins({"type": "CHAT_MESSAGE", "payload": payload})

    return msg

@router.websocket("/ws/{user_id}")
async def chat_websocket_endpoint(websocket: WebSocket, user_id: int):
    # Retrieve user from DB to know role
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        db.close()
        return

    role = user.role
    await ws_manager.connect(websocket, user_id, role)

    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            action = data.get("action")

            if action == "SEND_MESSAGE":
                target_customer_id = data.get("target_customer_id", user_id if role != "ADMIN" else None)
                if not target_customer_id:
                    continue

                conv_id = get_conversation_id_for_customer(target_customer_id)
                msg_text = data.get("message", "")
                order_id = data.get("order_id")

                if msg_text.strip():
                    new_msg = Message(
                        conversation_id=conv_id,
                        sender_id=user_id,
                        receiver_id=target_customer_id if role == "ADMIN" else None,
                        order_id=order_id,
                        message=msg_text,
                        message_type="TEXT",
                        is_read=False
                    )
                    db.add(new_msg)
                    db.commit()
                    db.refresh(new_msg)

                    payload = {
                        "id": new_msg.id,
                        "conversation_id": new_msg.conversation_id,
                        "sender_id": new_msg.sender_id,
                        "receiver_id": new_msg.receiver_id,
                        "order_id": new_msg.order_id,
                        "message": new_msg.message,
                        "message_type": new_msg.message_type,
                        "is_read": new_msg.is_read,
                        "created_at": new_msg.created_at.isoformat()
                    }

                    # Echo to sender
                    await ws_manager.send_personal_message({"type": "CHAT_MESSAGE", "payload": payload}, user_id)

                    # Send to counterpart
                    if role == "ADMIN":
                        await ws_manager.send_personal_message({"type": "CHAT_MESSAGE", "payload": payload}, target_customer_id)
                        create_notification(
                            db=db,
                            user_id=target_customer_id,
                            title="New Message from KrishnaArjun Bakers",
                            message=msg_text[:80],
                            notif_type="CHAT"
                        )
                    else:
                        await ws_manager.broadcast_to_admins({"type": "CHAT_MESSAGE", "payload": payload})

            elif action == "TYPING":
                target = data.get("target_customer_id", user_id if role != "ADMIN" else None)
                if role == "ADMIN" and target:
                    await ws_manager.send_personal_message({"type": "USER_TYPING", "user_id": user_id}, target)
                else:
                    await ws_manager.broadcast_to_admins({"type": "USER_TYPING", "customer_id": user_id})

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
        db.close()
    except Exception as e:
        ws_manager.disconnect(websocket, user_id)
        db.close()
