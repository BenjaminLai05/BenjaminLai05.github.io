from pydantic import BaseModel
from typing import List, Optional

class ScanHistoryBase(BaseModel):
    id: str
    date: str
    tumorCount: int
    modelConfidence: float
    url: str

class ScanHistoryCreate(ScanHistoryBase):
    patient_id: str

class ScanHistory(ScanHistoryBase):
    class Config:
        orm_mode = True
        from_attributes = True

class PatientBase(BaseModel):
    id: str
    name: str
    age: str
    gender: str
    status: str
    statusColor: str
    clinicalNotes: str
    lastScan: str

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    status: Optional[str] = None
    statusColor: Optional[str] = None
    clinicalNotes: Optional[str] = None
    lastScan: Optional[str] = None

class Patient(PatientBase):
    history: List[ScanHistory] = []

    class Config:
        orm_mode = True
        from_attributes = True
