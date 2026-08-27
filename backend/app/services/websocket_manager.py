from typing import Dict, List, Any
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        # Map user_id -> List[WebSocket]
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # List of admin WebSockets for quick broadcasting
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: int, role: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        if role == "ADMIN" and websocket not in self.admin_connections:
            self.admin_connections.append(websocket)
        logger.info(f"User {user_id} ({role}) connected via WebSocket. Active user sockets: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)
        logger.info(f"User {user_id} disconnected from WebSocket.")

    async def send_personal_message(self, message_data: dict, user_id: int):
        if user_id in self.active_connections:
            dead_sockets = []
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_text(json.dumps(message_data))
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                    dead_sockets.append(ws)
            for ws in dead_sockets:
                self.disconnect(ws, user_id)

    async def broadcast_to_admins(self, message_data: dict):
        dead_sockets = []
        for ws in self.admin_connections:
            try:
                await ws.send_text(json.dumps(message_data))
            except Exception as e:
                logger.error(f"Error broadcasting to admin: {e}")
                dead_sockets.append(ws)
        for ws in dead_sockets:
            if ws in self.admin_connections:
                self.admin_connections.remove(ws)

    async def broadcast_event(self, event_type: str, payload: dict, target_user_id: int = None):
        """Dispatches an event (ORDER_UPDATED, NEW_ORDER, CHAT_MESSAGE, NOTIFICATION, etc.)"""
        data = {
            "type": event_type,
            "payload": payload
        }
        if target_user_id:
            await self.send_personal_message(data, target_user_id)
        # Admins always receive operational updates
        await self.broadcast_to_admins(data)

ws_manager = WebSocketManager()
