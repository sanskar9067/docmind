from chat_model import Chat
from utils.doc_loader import load_and_process_pdf
from utils.retrieval import give_response
import uvicorn
from fastapi import FastAPI, Depends, Header, UploadFile, Form, File
from database import SessionLocal, engine, Base
from model import User
from sqlalchemy.orm import Session
import jwt
from openai import OpenAI

client = OpenAI()
Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/signup")
def signup(name: str = Form(...), email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    print(f"Signing up user: {name}, {email}")
    unique_id = db.query(User).count() + 1
    user = User(id=unique_id, name=name, email=email, password=password)
    existing_user = db.query(User).filter(
        User.email == email
    )
    if existing_user!=None and existing_user.first() is not None:
        return {"success": "False", "message": "User already exists!", "user": existing_user.first()}
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"success": "True", "message": "User signed up successfully!", "user": user}

@app.post("/login")
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    print(f"Logging in user: {email}")
    user = db.query(User).filter(
        User.email == email
    ).first()
    print(f"User found: {user}")
    if user == None:
        return {"success": "False", "message": "user not found"}
    
    if user.password != password:
        return {"success": "False", "message": "Incorrect password"}
    token = jwt.encode({"user_id": user.id, "email": user.email, "name": user.name}, 
                       "secret", algorithm="HS256")
    return {"success": "True", "message": "Login successful!", "token": token}   

@app.get("/profile")
def profile(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, "secret", algorithms=["HS256"])
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return {"success": "True", "message": "Profile retrieved successfully!", "user": user}
        else:
            return {"success": "False", "message": "User not found!"}
    except jwt.ExpiredSignatureError:
        return {"success": "False", "message": "Token has expired!"}
    except jwt.InvalidTokenError:
        return {"success": "False", "message": "Invalid token!"} 

@app.post("/upload")
async def upload(file: UploadFile = File(...), authorization: str = Header(...)):
    token = authorization.split(" ")[1]
    print(f"Received file upload: {file.filename}")
    try:
        payload = jwt.decode(token, "secret", algorithms=["HS256"])
        user_id = payload.get("user_id")
        content = await file.read()
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(content)
        indexing_result = load_and_process_pdf(file_path, user_id)
        return {"success": "True", "message": "File uploaded and processed successfully!"}
    except jwt.ExpiredSignatureError:
        return {"success": "False", "message": "Token has expired!"}
    except jwt.InvalidTokenError:
        return {"success": "False", "message": "Invalid token!"}
    
@app.post("/chat")
async def chat(message: str = Form(...), 
               chatType: str = Form(...), 
               authorization: str = Header(...),
               db: Session = Depends(get_db)):
    token = authorization.split(" ")[1]
    print(f"Received chat request: {message}")
    try:
        payload = jwt.decode(token, "secret", algorithms=["HS256"])
        user_id = payload.get("user_id")
        if chatType == "pdf":   
            response = give_response(message, user_id)
            print(f"Generated response: {response}")
            # Save the chat interaction to the database
            chat = Chat(user_id=user_id, message=message, response=response)
            db.add(chat)
            db.commit()
            return {"success": "True", "message": "Chat response retrieved successfully!", "response": response}
        else:
            response = client.responses.create(
                model="gpt-5",
                input=message
            )
            chat = Chat(user_id=user_id, message=message, response=response.output_text)
            db.add(chat)
            db.commit()
            return {"success": "True", "message": "Chat response retrieved successfully!", "response": response.output_text}
        
    except jwt.ExpiredSignatureError:
        return {"success": "False", "message": "Token has expired!"}
    except jwt.InvalidTokenError:
        return {"success": "False", "message": "Invalid token!"}

@app.get("/chat_history")
def chat_history(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, "secret", algorithms=["HS256"])
        user_id = payload.get("user_id")
        chats = db.query(Chat).filter(Chat.user_id == user_id).all()
        return {"success": "True", "message": "Chat history retrieved successfully!", "chats": chats}
    except jwt.ExpiredSignatureError:
        return {"success": "False", "message": "Token has expired!"}
    except jwt.InvalidTokenError:
        return {"success": "False", "message": "Invalid token!"}

    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)