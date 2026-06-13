import { useRef, useState } from 'react';

export default function FileUpload({ onUpload, uploading }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || uploading) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <h3>Upload PDF</h3>
      <p className="upload-panel__hint">
        Drop a PDF here to index it for document chat.
      </p>

      <div
        className={`upload-dropzone ${dragOver ? 'upload-dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="upload-dropzone__input"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="upload-dropzone__icon">📄</div>
        <p>
          {selectedFile ? (
            <strong>{selectedFile.name}</strong>
          ) : (
            <>Click or drag a PDF file</>
          )}
        </p>
        <span className="upload-dropzone__meta">PDF only</span>
      </div>

      <button
        type="submit"
        className="btn btn--secondary btn--full"
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'Processing…' : 'Upload & index'}
      </button>
    </form>
  );
}
