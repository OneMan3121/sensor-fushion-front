import React, { useState } from 'react'
import { CheckCircle, File, Loader, Upload, XCircle } from 'lucide-react'
import { buildApiUrl } from '../config/api'

const FileUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]

    if (selectedFile && (selectedFile.name.endsWith('.BIN') || selectedFile.name.endsWith('.bin'))) {
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
      return
    }

    setError('Будь ласка, оберіть файл у форматі .BIN')
    setFile(null)
  }

  const uploadFile = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(buildApiUrl('/upload'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Помилка сервера: ${response.statusText}`)
      }

      const result = await response.json()
      setSuccess(true)
      onUploadSuccess(result.session_id, result.data_summary)
    } catch (requestError) {
      setError(`Не вдалося завантажити файл: ${requestError.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
      <section className="upload-container">
        <div className="upload-content">
          <label htmlFor="file-input" className="upload-label">
            <Upload size={52} className={file ? 'upload-icon selected' : 'upload-icon'} />
            <p>
              {file
                  ? `Обрано файл: ${file.name}`
                  : 'Натисніть, щоб вибрати файл .BIN, або перетягніть його в цю область'}
            </p>
            <span className="upload-hint">
            Після завантаження панель автоматично підготує траєкторію, GPS і стани польоту.
          </span>
          </label>

          <input
              id="file-input"
              type="file"
              accept=".BIN,.bin"
              onChange={handleFileChange}
              style={{ display: 'none' }}
          />
        </div>

        {error && (
            <div className="upload-error">
              <XCircle size={18} />
              <span>{error}</span>
            </div>
        )}

        {success && (
            <div className="upload-success">
              <CheckCircle size={18} />
              <span>Файл успішно завантажено.</span>
            </div>
        )}

        <button onClick={uploadFile} disabled={!file || loading} className="upload-btn" type="button">
          {loading ? <Loader className="animate-spin" size={20} /> : <File size={20} />}
          {loading ? 'Обробка...' : 'Завантажити та проаналізувати'}
        </button>
      </section>
  )
}

export default FileUploader
