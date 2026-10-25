from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Notification, User
from ..schemas import NotificationOut
from ..security import get_current_user

router = APIRouter(tags=["Notification Bell API"])

@router.get("/notifications", response_model=list[NotificationOut])
@router.get("/api/notifications", response_model=list[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [NotificationOut.model_validate(n) for n in notifs]

@router.patch("/notifications/{notification_id}/read", response_model=NotificationOut)
@router.patch("/api/notifications/{notification_id}/read", response_model=NotificationOut)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.get(Notification, notification_id)
    if not notif or notif.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return NotificationOut.model_validate(notif)

@router.post("/notifications/read-all")
@router.post("/api/notifications/read-all")
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/notifications/{notification_id}")
@router.delete("/api/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.get(Notification, notification_id)
    if not notif or notif.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted successfully"}
