from sqlalchemy import Column, Integer, String
from database import Base

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    message = Column(String)
    response = Column(String)