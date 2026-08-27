from sqlalchemy.orm import Session
from app.models.models import Notification, User, UserRole
from app.services.websocket_manager import ws_manager
import asyncio

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notif_type: str = "GENERAL"
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    # Send WebSocket event asynchronously if loop is running
    try:
        payload = {
            "id": notif.id,
            "user_id": notif.user_id,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "is_read": notif.is_read,
            "created_at": notif.created_at.isoformat()
        }
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(ws_manager.broadcast_event("NEW_NOTIFICATION", payload, target_user_id=user_id))
    except Exception:
        pass
        
    return notif

def notify_admins(
    db: Session,
    title: str,
    message: str,
    notif_type: str = "ADMIN_ALERT"
):
    admins = db.query(User).filter(User.role == UserRole.ADMIN.value).all()
    for admin in admins:
        create_notification(db, admin.id, title, message, notif_type)
