from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()


def give_response(message, user_id):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    qdrant_client = QdrantClient(
        url="http://localhost:6333"
    )

    vector_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name=f"pdf_documents_{user_id}",
        embedding=embeddings
    )
    res = vector_store.similarity_search(message)
    context = "\n\n".join(
        doc.page_content
        for doc in res
    )
    SYSTEM_PROMPT = f"""
    You are an intelligent PDF Assistant that answers user questions based only on the 
    content retrieved from uploaded PDF documents. Analyze the provided context carefully 
    and generate accurate, clear, and concise responses using only the information available
    in the document. Do not make assumptions, fabricate information, or rely on external 
    knowledge. If the answer cannot be found or the context is insufficient, respond that 
    the information is not available in the uploaded document. Maintain a professional 
    and helpful tone, ask for clarification when a question is ambiguous, and format 
    responses for readability when appropriate. Always prioritize factual accuracy and 
    document-based evidence over speculation.

    context: {str(context)}
    """

    client = OpenAI()
    response = client.responses.create(
        model="gpt-5",
        input=SYSTEM_PROMPT + "\n\nUser Question: " + message
    )
    return response.output_text


