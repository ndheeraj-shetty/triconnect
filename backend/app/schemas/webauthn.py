from pydantic import BaseModel, Field
from typing import Dict, Any, List

class WebAuthnRegisterOptionsRequest(BaseModel):
    """Payload to request WebAuthn registration credential creation options."""
    username: str = Field(..., description="The User ID (username) registering a passkey")

class WebAuthnRegisterOptionsResponse(BaseModel):
    """Payload returning registration options to browser API."""
    options_json: Dict[str, Any] = Field(..., description="FIDO2 formatted options dictionary serialized for the browser")

class WebAuthnRegisterVerifyRequest(BaseModel):
    """Payload submitted to verify browser credential creation assertion."""
    username: str
    credential_payload: Dict[str, Any] = Field(..., description="Browser public key credential payload JSON")
    device_name: str | None = Field("My Key", description="Friendly device description")

class WebAuthnLoginOptionsRequest(BaseModel):
    """Payload to request WebAuthn authentication options."""
    username: str = Field(..., description="The User ID logging in")

class WebAuthnLoginOptionsResponse(BaseModel):
    """Payload returning assertion options to verify signatures."""
    options_json: Dict[str, Any] = Field(..., description="FIDO2 formatted assertion options JSON")

class WebAuthnLoginVerifyRequest(BaseModel):
    """Payload to verify browser signature assertion and login the user."""
    username: str
    assertion_payload: Dict[str, Any] = Field(..., description="Browser signature credential assertion JSON")
