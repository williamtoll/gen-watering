# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict
import RPi.GPIO as GPIO

# Initialize GPIO
GPIO.setmode(GPIO.BCM)  # Use BCM pin numbering

app = FastAPI()

# Device model and "database"
class Device(BaseModel):
    id: int
    name: str
    relay_port: int
    status: str = "off"

devices_db: Dict[int, Device] = {
    1: Device(id=1, name="Device A", relay_port=17),
    2: Device(id=2, name="Device B", relay_port=27),
}

# Set all device GPIO ports as output and turn them off initially
for device in devices_db.values():
    GPIO.setup(device.relay_port, GPIO.OUT)
    GPIO.output(device.relay_port, GPIO.LOW)

# Endpoint to list all devices
@app.get("/devices", response_model=Dict[int, Device])
async def list_devices():
    return devices_db

# Endpoint to start a device
@app.post("/devices/{device_id}/start")
async def start_device(device_id: int):
    device = devices_db.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    GPIO.output(device.relay_port, GPIO.HIGH)
    device.status = "on"
    return {"message": f"{device.name} started", "status": device.status}

# Endpoint to stop a device
@app.post("/devices/{device_id}/stop")
async def stop_device(device_id: int):
    device = devices_db.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    GPIO.output(device.relay_port, GPIO.LOW)
    device.status = "off"
    return {"message": f"{device.name} stopped", "status": device.status}

# Ensure GPIO cleanup on server shutdown
@app.on_event("shutdown")
def cleanup_gpio():
    GPIO.cleanup()

# Run the server with `uvicorn main:app --reload`
