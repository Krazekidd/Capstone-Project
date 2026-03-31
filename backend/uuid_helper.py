import uuid

def uuid_to_bytes(uuid_str: str) -> bytes:
    """Convert UUID string to bytes for MySQL BINARY(16) storage"""
    return uuid.UUID(uuid_str).bytes

def bytes_to_uuid(byte_data: bytes) -> str:
    """Convert MySQL BINARY(16) bytes to UUID string"""
    return str(uuid.UUID(bytes=byte_data))

def bytes_to_uuid_object(byte_data: bytes) -> uuid.UUID:
    """Convert MySQL BINARY(16) bytes to UUID object"""
    return uuid.UUID(bytes=byte_data)

def generate_uuid_bytes() -> bytes:
    """Generate new UUID as bytes for MySQL storage"""
    return uuid.uuid4().bytes