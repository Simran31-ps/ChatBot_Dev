import os
import uuid

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.vectorstores import Chroma

from app.core.config import settings


class RAGService:
    def __init__(self) -> None:
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def _get_collection_name(self, user_id: str, workspace_id: str | None = None) -> str:
        if workspace_id:
            return f"workspace_{workspace_id}"
        return f"user_{user_id}"

    async def ingest_document(
        self,
        file_path: str,
        user_id: str,
        document_id: str,
        workspace_id: str | None = None,
    ) -> int:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            loader = PyPDFLoader(file_path)
        elif ext in (".txt", ".md"):
            loader = TextLoader(file_path)
        elif ext == ".docx":
            from langchain_community.document_loaders import Docx2txtLoader

            loader = Docx2txtLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        documents = loader.load()
        chunks = self.text_splitter.split_documents(documents)

        for chunk in chunks:
            chunk.metadata["document_id"] = document_id
            chunk.metadata["user_id"] = user_id
            if workspace_id:
                chunk.metadata["workspace_id"] = workspace_id

        collection_name = self._get_collection_name(user_id, workspace_id)

        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

        embedding_fn = DefaultEmbeddingFunction()

        vectorstore = Chroma(
            collection_name=collection_name,
            persist_directory=self.persist_dir,
            embedding_function=embedding_fn,
        )
        vectorstore.add_documents(
            chunks,
            ids=[str(uuid.uuid4()) for _ in chunks],
        )

        return len(chunks)

    async def query(
        self,
        query: str,
        user_id: str,
        workspace_id: str | None = None,
        top_k: int = 5,
    ) -> list[str]:
        collection_name = self._get_collection_name(user_id, workspace_id)

        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

        embedding_fn = DefaultEmbeddingFunction()

        vectorstore = Chroma(
            collection_name=collection_name,
            persist_directory=self.persist_dir,
            embedding_function=embedding_fn,
        )

        results = vectorstore.similarity_search(query, k=top_k)
        return [doc.page_content for doc in results]

    async def delete_document(
        self,
        document_id: str,
        user_id: str,
        workspace_id: str | None = None,
    ) -> None:
        collection_name = self._get_collection_name(user_id, workspace_id)

        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

        embedding_fn = DefaultEmbeddingFunction()

        vectorstore = Chroma(
            collection_name=collection_name,
            persist_directory=self.persist_dir,
            embedding_function=embedding_fn,
        )

        vectorstore._collection.delete(where={"document_id": document_id})


rag_service = RAGService()
