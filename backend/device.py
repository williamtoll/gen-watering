# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import logging


import RPi.GPIO as GPIO

# GPIO setup
GPIO.setmode(GPIO.BCM)  # Use Broadcom pin-numbering
GPIO.setwarnings(False)

# Configure logging
logging.basicConfig(
    filename="/home/pi/watering_service.log",  # Path to log file
    level=logging.INFO,  # Log INFO level and above
    format="%(asctime)s - %(levelname)s - %(message)s",
)

app = FastAPI()

# Temporary in-memory "database" of devices
devices_db = {}


# Define the Device model
class Device(BaseModel):
    id: int
    name: str
    relay_port: int


# Endpoint to list all devices
@app.get("/devices", response_model=List[Device])
async def list_devices():
    return list(devices_db.values())


# Endpoint to add a new device
@app.post("/devices", response_model=Device)
async def add_device(device: Device):
    if device.id in devices_db:
        raise HTTPException(
            status_code=400, detail="Device with this ID already exists"
        )
    devices_db[device.id] = device
    return device


# Endpoint to edit an existing device
@app.put("/devices/{device_id}", response_model=Device)
async def update_device(device_id: int, device: Device):
    if device_id not in devices_db:
        raise HTTPException(status_code=404, detail="Device not found")
    devices_db[device_id] = device
    return device


# Endpoint to delete a device
@app.delete("/devices/{device_id}")
async def delete_device(device_id: int):
    if device_id not in devices_db:
        raise HTTPException(status_code=404, detail="Device not found")
    del devices_db[device_id]
    return {"message": "Device deleted successfully"}


# Run the server with `uvicorn main:app --reload`
