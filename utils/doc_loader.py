from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
import os

def load_and_process_pdf(file_path, user_id):
    # Load PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_documents(documents)

    # Create embeddings
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=os.getenv("OPENAI_API_KEY"))

    # Create vector store
    vector_store = QdrantVectorStore.from_documents(
        documents=texts, 
        embedding=embeddings, 
        url="http://localhost:6333", 
        collection_name=f"pdf_documents_{user_id}"
    )

    return vector_store