from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
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