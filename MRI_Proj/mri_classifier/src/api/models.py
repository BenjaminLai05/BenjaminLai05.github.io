from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(String)
    gender = Column(String)
    status = Column(String)
    statusColor = Column(String)
    clinicalNotes = Column(String)
    lastScan = Column(String)

    history = relationship("ScanHistory", back_populates="patient", cascade="all, delete-orphan")

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    date = Column(String)
    tumorCount = Column(Integer)
    modelConfidence = Column(Float)
    url = Column(String)

    patient = relationship("Patient", back_populates="history")
