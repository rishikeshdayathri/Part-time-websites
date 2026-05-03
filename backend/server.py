from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Subterra Nexus API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class InquiryCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(..., min_length=1, max_length=200)
    company: Optional[str] = Field(default="", max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(default="", max_length=50)
    country: Optional[str] = Field(default="", max_length=100)
    commodity: Optional[str] = Field(default="", max_length=200)
    quantity: Optional[str] = Field(default="", max_length=100)
    destination: Optional[str] = Field(default="", max_length=200)
    message: Optional[str] = Field(default="", max_length=5000)
    source: Optional[str] = Field(default="contact_page", max_length=100)


class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company: str = ""
    email: str
    phone: str = ""
    country: str = ""
    commodity: str = ""
    quantity: str = ""
    destination: str = ""
    message: str = ""
    source: str = "contact_page"
    email_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- Email helper ----------
def _smtp_configured() -> bool:
    required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM_EMAIL"]
    return all(os.environ.get(k) for k in required)


def _send_inquiry_email(payload: dict) -> bool:
    """Send inquiry email via SMTP. Returns True on success, False otherwise.
    Only runs if SMTP_* env vars are fully configured.
    """
    if not _smtp_configured():
        return False
    try:
        host = os.environ["SMTP_HOST"]
        port = int(os.environ["SMTP_PORT"])
        user = os.environ["SMTP_USER"]
        password = os.environ["SMTP_PASSWORD"]
        from_email = os.environ["SMTP_FROM_EMAIL"]
        to_email = os.environ.get("SMTP_TO_EMAIL", "info@subterranexus.com")

        subject = f"New Trade Inquiry — {payload.get('commodity') or 'General'} ({payload.get('name')})"
        html = f"""
        <html><body style="font-family:Arial,Helvetica,sans-serif;color:#0F172A;">
          <h2 style="color:#0A192F;margin:0 0 12px 0;">New Trade Inquiry</h2>
          <p style="color:#475569;margin:0 0 20px 0;">Submitted via Subterra Nexus website</p>
          <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px;">
            <tr><td style="background:#F8FAFC;width:200px;"><b>Name</b></td><td>{payload.get('name','')}</td></tr>
            <tr><td style="background:#F8FAFC;"><b>Company</b></td><td>{payload.get('company','')}</td></tr>
            <tr><td style="background:#F8FAFC;"><b>Email</b></td><td>{payload.get('email','')}</td></tr>
            <tr><td style="background:#F8FAFC;"><b>Phone / WhatsApp</b></td><td>{payload.get('phone','')}</td></tr>
            <tr><td style="background:#F8FAFC;"><b>Country</b></td><td>{payload.get('country','')}</td></tr>
            <tr><td style="background:#F8FAFC;"><b>Commodity</b></td><td>{payload.get('commodity','')}</td></tr>
            <tr><td style="background:#F8FAFC;"><b>Quantity</b></td><td>{payload.get('quantity','')}</td></tr>
            <tr><td style="background:#F8FAFC;"><b>Delivery Destination</b></td><td>{payload.get('destination','')}</td></tr>
            <tr><td style="background:#F8FAFC;vertical-align:top;"><b>Message</b></td><td>{payload.get('message','').replace(chr(10), '<br/>')}</td></tr>
            <tr><td style="background:#F8FAFC;"><b>Source</b></td><td>{payload.get('source','')}</td></tr>
          </table>
          <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Subterra Nexus Pvt Ltd · Hyderabad, India</p>
        </body></html>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Reply-To"] = payload.get("email", from_email)
        msg.attach(MIMEText(html, "html"))

        ctx = ssl.create_default_context()
        if port == 465:
            with smtplib.SMTP_SSL(host, port, context=ctx, timeout=20) as server:
                server.login(user, password)
                server.sendmail(from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=20) as server:
                server.ehlo()
                server.starttls(context=ctx)
                server.ehlo()
                server.login(user, password)
                server.sendmail(from_email, [to_email], msg.as_string())
        return True
    except Exception as e:
        logger.error(f"SMTP send failed: {e}")
        return False


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Subterra Nexus API", "status": "ok"}


@api_router.get("/health")
async def health():
    return {
        "status": "healthy",
        "smtp_configured": _smtp_configured(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate, background_tasks: BackgroundTasks):
    inquiry = Inquiry(**payload.model_dump())

    doc = inquiry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()

    try:
        await db.inquiries.insert_one(doc)
    except Exception as e:
        logger.exception("Failed to persist inquiry")
        raise HTTPException(status_code=500, detail="Unable to save inquiry") from e

    # Fire-and-forget email attempt (only if SMTP is configured)
    if _smtp_configured():
        background_tasks.add_task(_send_inquiry_email, doc)

    return inquiry


@api_router.get("/inquiries", response_model=List[Inquiry])
async def list_inquiries(limit: int = 100):
    limit = max(1, min(limit, 500))
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            try:
                d["created_at"] = datetime.fromisoformat(d["created_at"])
            except Exception:
                d["created_at"] = datetime.now(timezone.utc)
    return docs


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
