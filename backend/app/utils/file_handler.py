import os
import uuid
from fastapi import UploadFile
from app.core.config import settings

def generate_secure_filename(original_name: str) -> str:
    """Create a unique, safe filename using UUIDs and retaining original extensions."""
    _, ext = os.path.splitext(original_name)
    # Default to .dat if no extension found
    if not ext:
        ext = ".dat"
    return f"{uuid.uuid4()}{ext}"

async def save_uploaded_file(file: UploadFile, subfolder: str) -> str:
    """Save an UploadFile to disk inside a category directory and return the relative path."""
    dest_dir = os.path.join(settings.UPLOAD_DIRECTORY, subfolder)
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir, exist_ok=True)
        
    secure_name = generate_secure_filename(file.filename or "file")
    dest_path = os.path.join(dest_dir, secure_name)
    
    with open(dest_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Return path with forward slashes for cross-platform integration
    relative_path = os.path.join(settings.UPLOAD_DIRECTORY, subfolder, secure_name)
    return relative_path.replace("\\", "/")
