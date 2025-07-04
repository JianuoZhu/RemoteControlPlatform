from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import json
from datetime import datetime
from typing import List, Optional, Dict, Any

app = FastAPI()

# 配置 CORS
origins = [
    "https://localhost:5100",
    "https://127.0.0.1:5100",
    "https://120.232.252.116:5100",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class EmergencyContact(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    relationship: str
    isPrimary: bool

class NotificationPreferences(BaseModel):
    email: bool
    sms: bool
    push: bool

class UserProfile(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    emergencyContacts: List[EmergencyContact]
    notificationPreferences: NotificationPreferences
    createdAt: str
    updatedAt: str

class EmergencyAlert(BaseModel):
    id: str
    type: str
    level: str
    title: str
    message: str
    timestamp: str
    location: Optional[str] = None
    severity: str
    isAcknowledged: bool
    acknowledgedAt: Optional[str] = None
    acknowledgedBy: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# 模拟数据存储
user_profile = UserProfile(
    id="1",
    name="张三",
    phone="13800138000",
    email="zhangsan@example.com",
    emergencyContacts=[
        EmergencyContact(
            id="1",
            name="李四",
            phone="13900139000",
            email="lisi@example.com",
            relationship="子女",
            isPrimary=True
        )
    ],
    notificationPreferences=NotificationPreferences(
        email=True,
        sms=True,
        push=True
    ),
    createdAt=datetime.now().isoformat(),
    updatedAt=datetime.now().isoformat()
)

emergency_alerts = []

@app.get("/items/battery")
async def get_battery():
    """
        获取电池状态
        返回一个包含电池状态的字典
        返回的字典包含两个键：
        - status: 电池状态，值为 "healthy" 或 "unhealthy"
        - level: 电池电量，值为 0 到 100 的整数
        level为随机值
    """
    return {"status": "healthy", "level": random.randint(20, 100)}

@app.get("/items/joints")
async def get_joints_status():
    """
        获取关节状态
        返回一个包含关节状态的字典
        返回的字典包含两个键：
        - name: 关节名称，值为 "joint1~joint3"
        - angle: 关节角度，值为 0 到 180 的整数
        - healthy: 关节状态，值为 true 或 false
        angle为随机值, healthy为随机布尔值
    """
    joints_status = []
    for i in range(1, 4):
        joints_status.append({
            "name": f"joint{i}",
            "angle": random.randint(0, 180),
            "healthy": random.choice([True, False])
        })
    return joints_status

@app.get("/items/tasks")
async def get_tasks():
    """
        获取任务列表
        返回一个包含任务列表的字典
        返回的字典包含一个键：
        - tasks: 任务列表，每个任务包含 id, title, state
        任务状态可能为 "running", "queued", "done"
    """
    tasks = [{ "id": "t1", "title": "巡逻 A 区", "state": "running" },
  { "id": "t2", "title": "充电", "state": "queued" },
  { "id": "t3", "title": "上传日志", "state": "done" }]
    return tasks

# 用户配置相关API
@app.get("/user/profile")
async def get_user_profile():
    """获取用户配置信息"""
    return user_profile

@app.patch("/user/profile")
async def update_user_profile(profile_update: dict):
    """更新用户配置信息"""
    global user_profile
    
    # 更新用户信息
    for key, value in profile_update.items():
        if key in ["name", "phone", "email", "notificationPreferences"]:
            setattr(user_profile, key, value)
    
    user_profile.updatedAt = datetime.now().isoformat()
    return user_profile

@app.post("/user/emergency-contacts")
async def add_emergency_contact(contact: EmergencyContact):
    """添加紧急联系人"""
    global user_profile
    
    # 生成新ID
    contact.id = str(len(user_profile.emergencyContacts) + 1)
    user_profile.emergencyContacts.append(contact)
    user_profile.updatedAt = datetime.now().isoformat()
    
    return contact

@app.patch("/user/emergency-contacts/{contact_id}")
async def update_emergency_contact(contact_id: str, contact_update: dict):
    """更新紧急联系人"""
    global user_profile
    
    for contact in user_profile.emergencyContacts:
        if contact.id == contact_id:
            for key, value in contact_update.items():
                if hasattr(contact, key):
                    setattr(contact, key, value)
            user_profile.updatedAt = datetime.now().isoformat()
            return contact
    
    return {"error": "Contact not found"}

@app.delete("/user/emergency-contacts/{contact_id}")
async def delete_emergency_contact(contact_id: str):
    """删除紧急联系人"""
    global user_profile
    
    user_profile.emergencyContacts = [
        contact for contact in user_profile.emergencyContacts 
        if contact.id != contact_id
    ]
    user_profile.updatedAt = datetime.now().isoformat()
    
    return {"message": "Contact deleted"}

# 紧急报警相关API
@app.post("/emergency/trigger")
async def trigger_emergency_alert(alert_data: dict):
    """触发紧急报警"""
    global emergency_alerts
    
    alert_id = str(len(emergency_alerts) + 1)
    alert_type = alert_data.get("type", "emergency_other")
    metadata = alert_data.get("metadata", {})
    
    # 根据报警类型生成相应的信息
    alert_info = {
        "emergency_fall": {
            "title": "老人摔倒报警",
            "message": "检测到老人摔倒，需要立即关注",
            "level": "critical",
            "severity": "critical"
        },
        "emergency_heart_rate": {
            "title": "心率异常报警",
            "message": "检测到心率异常，需要医疗关注",
            "level": "critical",
            "severity": "high"
        },
        "emergency_other": {
            "title": "紧急情况报警",
            "message": "检测到紧急情况，需要立即处理",
            "level": "critical",
            "severity": "medium"
        }
    }
    
    info = alert_info.get(alert_type, alert_info["emergency_other"])
    
    alert = EmergencyAlert(
        id=alert_id,
        type=alert_type,
        level=info["level"],
        title=info["title"],
        message=info["message"],
        timestamp=datetime.now().isoformat(),
        location=metadata.get("location"),
        severity=info["severity"],
        isAcknowledged=False,
        metadata=metadata
    )
    
    emergency_alerts.append(alert)
    
    # 模拟发送通知
    await send_notifications(alert)
    
    return alert

@app.get("/emergency/alerts")
async def get_emergency_alerts():
    """获取紧急报警列表"""
    return emergency_alerts

@app.patch("/emergency/alerts/{alert_id}/acknowledge")
async def acknowledge_emergency_alert(alert_id: str):
    """确认紧急报警"""
    global emergency_alerts
    
    for alert in emergency_alerts:
        if alert.id == alert_id:
            alert.isAcknowledged = True
            alert.acknowledgedAt = datetime.now().isoformat()
            alert.acknowledgedBy = "admin"
            return {"message": "Alert acknowledged"}
    
    return {"error": "Alert not found"}

@app.post("/emergency/test-notification")
async def test_emergency_notification():
    """测试紧急通知"""
    # 模拟发送测试通知
    print("发送测试紧急通知...")
    print(f"收件人: {user_profile.name} ({user_profile.phone}, {user_profile.email})")
    print("紧急联系人:")
    for contact in user_profile.emergencyContacts:
        print(f"  - {contact.name} ({contact.phone}, {contact.email})")
    
    return {"message": "Test notification sent"}

async def send_notifications(alert: EmergencyAlert):
    """发送通知给用户和紧急联系人"""
    print(f"发送紧急报警通知: {alert.title}")
    print(f"消息: {alert.message}")
    print(f"时间: {alert.timestamp}")
    
    # 发送给主用户
    if user_profile.notificationPreferences.email:
        print(f"发送邮件给: {user_profile.email}")
    if user_profile.notificationPreferences.sms:
        print(f"发送短信给: {user_profile.phone}")
    
    # 发送给紧急联系人
    for contact in user_profile.emergencyContacts:
        if user_profile.notificationPreferences.email and contact.email:
            print(f"发送邮件给紧急联系人: {contact.name} ({contact.email})")
        if user_profile.notificationPreferences.sms and contact.phone:
            print(f"发送短信给紧急联系人: {contact.name} ({contact.phone})")
    
    print("通知发送完成")