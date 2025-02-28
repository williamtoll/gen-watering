import platform
from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
from dateutil.rrule import rrule, DAILY, WEEKLY, MONTHLY, YEARLY
import asyncpg
from response_model import APIResponse  # Import the response model
from dotenv import load_dotenv
import os
import logging
import pendulum
from fastapi.middleware.cors import CORSMiddleware
import re
import pytz

load_dotenv()

# Configure logging
logging.basicConfig(
    filename="backend.log",  # Path to log file
    level=logging.INFO,  # Log INFO level and above
    format="%(asctime)s - %(levelname)s - %(message)s",
)


# PostgreSQL connection settings
DB_USER = os.getenv("POSTGRES_USER")
print(DB_USER)
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")  # Default to 5432 if not set


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://smartwatering.lat",
        "http://localhost",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Frequency mapping for rrule
FREQUENCY_MAP = {
    "daily": DAILY,
    "weekly": WEEKLY,
    "monthly": MONTHLY,
    "yearly": YEARLY,
}


class DeviceResponse(BaseModel):
    id: int
    name: str
    is_running: bool


class ScheduleRequest(BaseModel):
    start_date: datetime = Field(..., description="Start date of the event")
    end_date: Optional[datetime] = Field(
        None, description="End date to limit occurrences"
    )
    frequency: str = Field(
        ..., description="Recurring frequency (daily, weekly, monthly, yearly)"
    )
    interval: int = Field(1, description="Interval between occurrences")
    count: Optional[int] = Field(None, description="Number of occurrences to generate")
    byweekday: Optional[List[int]] = Field(
        None, description="List of weekdays (0=Monday, 6=Sunday)"
    )
    device_id: int
    duration: int  # Duration in minutes
    time: str


class ScheduleResponse(BaseModel):
    occurrences: Optional[List[str]] = Field(
        ..., description="List of scheduled event occurrences as ISO 8601 strings"
    )


async def connect_db():
    """Connect to the PostgreSQL database."""
    return await asyncpg.connect(
        user=DB_USER, password=DB_PASSWORD, database=DB_NAME, host=DB_HOST, port=DB_PORT
    )


def is_raspberry_pi():
    return "raspberrypi" in platform.uname().node


if is_raspberry_pi():
    import RPi.GPIO as GPIO

    # GPIO setup
    GPIO.setmode(GPIO.BCM)  # Use Broadcom pin-numbering
    GPIO.setwarnings(False)


@app.get("/api/devices", response_model=List[DeviceResponse])
async def get_devices():
    """Fetch the list of devices."""
    try:
        conn = await connect_db()
        rows = await conn.fetch("SELECT id, name,is_running FROM device order by id")
        await conn.close()
        return [
            {"id": row["id"], "name": row["name"], "is_running": row["is_running"]}
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/schedules", response_model=APIResponse)
async def get_schedules():
    """Fetch schedules with occurrences and device information."""
    try:
        conn = await connect_db()
        query = """
        SELECT s.id, s.start_date AT TIME ZONE 'America/Asuncion' as start_date, s.end_date AT TIME ZONE 'America/Asuncion' as end_date,CAST(EXTRACT(EPOCH FROM duration) / 60 AS INTEGER) as duration_minutes, d.name as device_name, s.status, d.id as device_id,frequency,interval,
        d.color as device_color, to_char(start_date, 'HH24:MI:SS') as start_time, to_char(end_date, 'HH24:MI:SS') as end_time
        FROM schedule s
        JOIN device d ON s.fk_device_schedule = d.id
        where s.start_date >= CURRENT_DATE - INTERVAL '1 month'
        ORDER BY s.start_date desc;
        """
        rows = await conn.fetch(query)
        await conn.close()

        schedules = [
            {
                "title": f"{row['device_name']} ({row['duration_minutes']} min )",
                "start": pytz.timezone("America/Asuncion")
                .localize(row["start_date"])
                .isoformat(),
                "end": pytz.timezone("America/Asuncion")
                .localize(row["end_date"])
                .isoformat(),
                "start_time": row["start_time"],
                "end_time": row["end_time"],
                "duration_minutes": row["duration_minutes"],
                "device_name": row["device_name"],
                "status": row["status"],
                "frequency": row["frequency"],
                "interval": row["interval"],
                "id": row["id"],
            }
            for row in rows
        ]

        return APIResponse(
            status="success",
            message="Schedules fetched successfully.",
            result=schedules,
        )
    except Exception as e:
        return APIResponse(
            status="error", message="Failed to fetch schedules.", error_reason=str(e)
        )


def formatDuration(duration):
    duration_item = pendulum.duration(
        hours=duration.seconds // 3600,
        minutes=(duration.seconds % 3600) // 60,
        seconds=duration.seconds % 60,
    )
    formatted_duration = duration_item.in_words(locale="es")
    return f"Duración: {formatted_duration}"


@app.post("/api/generate_schedule", response_model=APIResponse)
async def generate_new_schedule(request: ScheduleRequest):
    logging.info("request")
    logging.info(request)
    """Generate recurring schedules based on input parameters."""
    if request.frequency not in FREQUENCY_MAP:
        return {
            "error": "Invalid frequency. Choose from: daily, weekly, monthly, yearly."
        }

    logging.info("request date", request.start_date)
    time_obj = datetime.strptime(request.time, "%H:%M:%S").time()

    start_date = datetime.now().replace(
        hour=time_obj.hour, minute=time_obj.minute, second=time_obj.second
    )

    local_dt = pytz.timezone("America/Asuncion").localize(
        start_date
    )  # Change timezone as needed
    start_utc = local_dt.astimezone(pytz.utc)
    logging.info("start_utc ", start_utc)

    local_dt = pytz.timezone("America/Asuncion").localize(
        request.end_date
    )  # Change timezone as needed
    end_utc = request.end_date.astimezone(pytz.utc)

    rule = rrule(
        freq=FREQUENCY_MAP[request.frequency],
        dtstart=start_utc,
        until=end_utc,
        interval=request.interval,
        count=request.count,
        byweekday=request.byweekday,
    )

    logging.info("rule ", rule)

    # Calculate event occurrences and end times
    occurrences = []

    for start in rule:
        date = re.findall("\d{4}-\d{2}-\d{2}", str(start))[0]
        dt_str = f"{date} {request.time}"  # Adding seconds
        logging.info("date ", dt_str)
        dt_obj = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
        # dt_obj = dt_obj.replace(tzinfo=timezone.utc).timestamp()
        # dt_obj = datetime.date(dt_obj, "%Y-%m-%d %H:%M:%S")

        logging.info("date_combined ", dt_obj)

        end = dt_obj + timedelta(minutes=request.duration)

        local_dt = pytz.timezone("America/Asuncion").localize(
            dt_obj
        )  # Change timezone as needed
        start_utc = local_dt.astimezone(pytz.utc)
        logging.info("start_utc ", start_utc)

        local_dt = pytz.timezone("America/Asuncion").localize(
            end
        )  # Change timezone as needed
        end_utc = end.astimezone(pytz.utc)
        logging.info("end_utc ", end_utc)

        occurrences.append(
            {
                "start": start_utc,
                "end": end_utc,
                "freq": request.frequency,
                "interval": request.interval,
            }
        )

    # # Convert occurrences to ISO 8601 format strings
    # occurrences = [occurrence.isoformat() for occurrence in rule]

    logging.info("ocurrences")
    logging.info(occurrences)

    # Store occurrences in the PostgreSQL database
    try:
        conn = await connect_db()
        async with conn.transaction():
            for occ in occurrences:
                await conn.execute(
                    "INSERT INTO schedule (start_date, end_date, fk_device_schedule, duration,  status,interval,frequency) VALUES ($1, $2, $3, $4,'pending',$5,$6)",
                    occ["start"],
                    occ["end"],
                    request.device_id,
                    timedelta(minutes=request.duration),
                    occ["interval"],
                    occ["freq"],
                )

                logging.info("inserted successfully")
                logging.info(occ)
        await conn.close()
        # Convert occurrences to ISO 8601 strings for the response
        return APIResponse(
            status="success",
            message="Schedules saved successfully.",
            result="",
        )
    except Exception as e:
        logging.info(f"Database error: {str(e)}")
        return APIResponse(
            status="error", message="Failed to generate schedule.", error_reason=str(e)
        )


@app.delete("/api/schedules/{schedule_id}", response_model=APIResponse)
async def delete_schedule(
    schedule_id: int = Path(..., description="ID of the schedule to delete"),
):
    """Delete a schedule from the database by ID."""
    try:
        conn = await connect_db()

        # Delete the schedule from the database
        result = await conn.execute("DELETE FROM schedule WHERE id = $1", schedule_id)
        await conn.close()

        # Check if a row was deleted
        if result == "DELETE 0":
            raise HTTPException(
                status_code=404, detail=f"Schedule with ID {schedule_id} not found"
            )

        return APIResponse(
            status="success",
            message="Schedule deleted successfully.",
            result={"schedule_id": schedule_id},
        )
    except Exception as e:
        return APIResponse(
            status="error", message="Failed to delete schedule.", error_reason=str(e)
        )


def start_watering(relay_port, device_id, device_name):
    """Activates the relay on the specified port."""
    logging.info(
        f"Try Start Watering  {device_id} {device_name} on relay port {relay_port} ."
    )
    # GPIO.setup(relay_port, GPIO.OUT)
    # GPIO.output(relay_port, True)
    logging.info(
        f"Watering started  {device_id} {device_name} on relay port {relay_port} ."
    )


def stop_watering(relay_port, device_id, device_name):
    """Deactivates the relay on the specified port."""
    logging.info(
        f"Try Stop Watering  {device_id} {device_name} on relay port {relay_port} ."
    )
    # GPIO.output(relay_port, False)
    logging.info(
        f"Watering stopped  {device_id} {device_name} on relay port {relay_port} ."
    )


async def update_device_status(conn, device_id: int, status: bool):
    """Updates the status of a device"""
    print("updating device $1 status ", device_id, str(status).lower)
    await conn.execute(
        "UPDATE device SET is_running = $1 WHERE id = $2", status, device_id
    )


@app.post("/api/device/{device_id}/toggle")
async def toggle_device(device_id: int = Path(..., description="Device ID")):
    try:
        conn = await connect_db()
        rows = await conn.fetch(
            "SELECT id, name,is_running,relay_port FROM device where id=$1", device_id
        )
        print("rows ", rows)
        print("is running ", rows[0]["is_running"])
        if rows[0]["is_running"]:
            stop_watering(
                relay_port=rows[0]["relay_port"],
                device_id=rows[0]["id"],
                device_name=rows[0]["name"],
            )
            await update_device_status(conn, device_id, False)

        else:
            start_watering(
                relay_port=rows[0]["relay_port"],
                device_id=rows[0]["id"],
                device_name=rows[0]["name"],
            )
            await update_device_status(conn, device_id, True)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        await conn.close()


# update schedule
@app.put("/api/schedules/{schedule_id}", response_model=APIResponse)
async def update_schedule(
    request: ScheduleRequest,
    schedule_id: int = Path(..., description="ID of the schedule to update"),
):
    logging.info("request")
    logging.info(request)
    print(timedelta(minutes=request.duration))
    print(request)
    """Update a schedule in the database by ID."""
    try:
        conn = await connect_db()

        # Update the schedule in the database
        result = await conn.execute(
            "UPDATE schedule SET start_date = $1, end_date = $2, fk_device_schedule = $3, duration = $4, frequency = $5, interval = $6 WHERE id = $7",
            request.start_date,
            request.end_date,
            request.device_id,
            timedelta(minutes=request.duration),
            request.frequency,
            request.interval,
            schedule_id,
        )
        await conn.close()

        # Check if a row was updated
        if result == "UPDATE 0":
            raise HTTPException(
                status_code=404, detail=f"Schedule with ID {schedule_id} not found"
            )

        return APIResponse(
            status="success",
            message="Schedule updated successfully.",
            result={"schedule_id": schedule_id},
        )
    except Exception as e:
        return APIResponse(
            status="error", message="Failed to update schedule.", error_reason=str(e)
        )
