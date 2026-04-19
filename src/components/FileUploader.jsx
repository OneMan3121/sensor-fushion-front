import React, { useState } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader } from 'lucide-react';

const FileUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.BIN') || selectedFile.name.endsWith('.bin'))) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Будь ласка, оберіть файл формату .BIN');
      setFile(null);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Помилка сервера: ${response.statusText}`);
      }

      const result = await response.json();
      setSuccess(true);
      onUploadSuccess(result.session_id, result.data_summary);
    } catch (err) {
      setError(`Не вдалося завантажити файл: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <label htmlFor="file-input" className="upload-label">
          <Upload size={48} className={file ? 'upload-icon selected' : 'upload-icon'} />
          <p>
            {file ? `Вибрано: ${file.name}` : 'Клацніть для вибору файлу .BIN або перетягніть його сюди'}
          </p>
        </label>
        <input
          type="file"
          accept=".BIN,.bin"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />
      </div>

      {error && (
        <div className="upload-error">
          <XCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="upload-success">
          <CheckCircle size={18} /> <span>Файл успішно завантажено!</span>
        </div>
      )}

      <button
        onClick={uploadFile}
        disabled={!file || loading}
        className="upload-btn"
      >
        {loading ? <Loader className="animate-spin" size={20} /> : <File size={20} />}
        {loading ? 'Обробка...' : 'Завантажити та проаналізувати'}
      </button>
    </div>
  );
};

export default FileUploader;
