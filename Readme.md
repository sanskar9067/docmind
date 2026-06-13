# PDF Chat App

A local web application that lets authenticated users upload PDFs and ask questions about their content using embeddings, Qdrant, and OpenAI.

## Overview

This project includes:
- A **FastAPI backend** in `main.py` for authentication, PDF upload, document processing, and chat.
- A **React frontend** in `frontend/` for login/signup, file upload, and chat.
- A **PostgreSQL database** managed by Docker Compose for users and chat history.
- A **Qdrant vector store** for storing PDF embeddings and retrieving context for PDF question answering.

## How it Works

1. User signs up or logs in through the frontend.
2. Backend issues a JWT token on successful login.
3. User uploads a PDF file to `/upload` with the token.
4. Backend loads the PDF, splits text into chunks, generates embeddings, and stores them in a per-user Qdrant collection.
5. When the user asks a question with `chatType=pdf`, the app performs similarity search on the Qdrant store, assembles the matched text, and sends it to OpenAI for an answer.
6. Chat history is stored in the database and can be retrieved from `/chat_history`.

## Architecture

- `main.py` - FastAPI server with endpoints for `/signup`, `/login`, `/upload`, `/chat`, `/profile`, and `/chat_history`.
- `database.py` - SQLAlchemy database connection using `DATABASE_URL` from environment variables.
- `model.py` - `User` SQLAlchemy model.
- `chat_model.py` - `Chat` SQLAlchemy model.
- `utils/doc_loader.py` - PDF loader and chunking logic with embeddings and Qdrant storage.
- `utils/retrieval.py` - Similarity search and prompt creation for PDF-based chat.
- `frontend/` - React application proxied to backend on `http://localhost:8000`.

## Prerequisites

- Python 3.11+ (or compatible)
- Node.js 18+ / npm
- Docker and Docker Compose
- Qdrant running locally on `http://localhost:6333`
- OpenAI API key

## Environment Variables

Create a `.env` file in the project root with the following:

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://admin:password123@localhost:5432/fastapi_db
```

Adjust `DATABASE_URL` if you use a different user, password, host, port, or database name.

## Setup

### 1. Start PostgreSQL

From the `postgres/` directory:

```bash
cd postgres
docker compose up -d
```

This starts PostgreSQL on `localhost:5432`.

### 2. Start Qdrant

Qdrant must be running on `http://localhost:6333`.

Use Docker if needed:

```bash
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant
```

### 3. Install Backend Dependencies

From the project root:

```bash
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn sqlalchemy python-dotenv pyjwt openai langchain-openai langchain-qdrant langchain-community langchain-text-splitters qdrant-client
```

### 4. Install Frontend Dependencies

From the `frontend/` folder:

```bash
cd frontend
npm install
```

### 5. Run the Backend

From the project root:

```bash
python main.py
```

The FastAPI server will start on `http://localhost:8000`.

### 6. Run the Frontend

From `frontend/`:

```bash
npm start
```

The React app will open in the browser and proxy API requests to the backend.

## Usage

1. Open the React app in your browser.
2. Sign up with a name, email, and password.
3. Log in and save the returned JWT token in the frontend.
4. Upload a PDF file.
5. Ask questions using the chat interface.
6. PDF questions are handled by `chatType=pdf` and answered from the uploaded PDF context.

## API Endpoints

- `POST /signup`
  - Form fields: `name`, `email`, `password`
  - Creates a new user.

- `POST /login`
  - Form fields: `email`, `password`
  - Returns a JWT token on success.

- `GET /profile`
  - Requires `Authorization: Bearer <token>` header.
  - Returns authenticated user details.

- `POST /upload`
  - Requires `Authorization: Bearer <token>` header.
  - Body: `file` upload.
  - Saves the PDF to `uploads/`, processes it, and stores embeddings in Qdrant.

- `POST /chat`
  - Requires `Authorization: Bearer <token>` header.
  - Form fields: `message`, `chatType`
  - `chatType=pdf` uses document context from Qdrant.
  - Other chat types use OpenAI direct responses.

- `GET /chat_history`
  - Requires `Authorization: Bearer <token>` header.
  - Returns chat messages stored for the user.

## Notes

- Tokens are signed with the hardcoded secret `secret` in `main.py`.
  - For production, replace this with a secure secret and rotate periodically.
- The app stores uploaded PDFs in `uploads/` by filename.
  - Avoid filename collisions in production.
- Qdrant collections are created per user as `pdf_documents_<user_id>`.

## Troubleshooting

- If the backend cannot connect to PostgreSQL, verify `DATABASE_URL` and that Docker Compose started successfully.
- If Qdrant is unreachable, confirm it is listening on `http://localhost:6333`.
- If OpenAI returns authentication errors, double-check `OPENAI_API_KEY` in `.env`.
- If the frontend cannot reach the backend, confirm the React proxy is enabled and backend is running on `http://localhost:8000`.

## Optional Improvements

- Add a `requirements.txt` for backend dependency management.
- Secure JWT secrets and password storage (hashing).
- Persist uploaded PDF metadata in the database.
- Add upload and chat validation in the frontend.

