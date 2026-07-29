from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime, date

# --- Settings ---
class AttendanceSettingsBase(BaseModel):
    school_name: str
    campus_name: str
    latitude: float
    longitude: float
    radius: float
    start_time: str
    end_time: str
    late_threshold: str
    face_match_threshold: float
    max_face_attempts: int
    liveness_sensitivity: float

class AttendanceSettingsUpdate(BaseModel):
    school_name: str | None = None
    campus_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius: float | None = None
    start_time: str | None = None
    end_time: str | None = None
    late_threshold: str | None = None
    face_match_threshold: float | None = None
    max_face_attempts: int | None = None
    liveness_sensitivity: float | None = None

class AttendanceSettingsResponse(AttendanceSettingsBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID


# --- Daily Session ---
class AttendanceSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    date: date
    start_time: datetime
    end_time: datetime


# --- Verification & Submission Request ---
class AttendanceVerificationRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: float | None = None
    device_info: str | None = None
    
    # Biometric/Liveness Challenge response
    liveness_challenge: str  # e.g., "Blink", "Smile"
    liveness_verified: bool   # Simulates local/remote inference success
    liveness_score: float
    
    # Face recognition matching payload
    face_match_confidence: float # Simulates embeddings similarity
    face_mesh_vector: str | None = None
    live_face_embedding: str | None = None


# --- Verification Results Response ---
class AttendanceRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    session_id: UUID
    timestamp: datetime
    status: str
    
    latitude: float | None
    longitude: float | None
    accuracy: float | None
    face_match_confidence: float | None
    liveness_score: float | None
    device_info: str | None
    
    verified_gps: bool
    verified_liveness: bool
    verified_face: bool


# --- Logs & Violations ---
class AttendanceLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    timestamp: datetime
    status: str
    reason: str | None
    details: str | None

class ViolationLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    timestamp: datetime
    latitude: float
    longitude: float
    distance: float
    allowed_radius: float


# --- Compatibility Stubs ---
class AttendanceBase(BaseModel):
    status: str
    method: str
    latitude: float | None = None
    longitude: float | None = None
    geofence_verified: bool = False

class AttendanceCreate(AttendanceBase):
    class_id: UUID

class AttendanceResponse(AttendanceBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    class_id: UUID
    timestamp: datetime


# --- School Locations (Multi-campus Geofencing) ---
class SchoolLocationBase(BaseModel):
    school_id: str | None = None
    campus_name: str
    latitude: float
    longitude: float
    formatted_address: str | None = None
    attendance_radius: float

class SchoolLocationCreate(SchoolLocationBase):
    pass

class SchoolLocationResponse(SchoolLocationBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: UUID | None = None

