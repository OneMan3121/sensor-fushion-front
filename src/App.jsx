import { useState } from 'react'
import './App.css'
import FileUploader from './components/FileUploader'
import TrajectoryCharts from './components/TrajectoryCharts'
import { Download, Activity, Database, AlertCircle, BarChart3, Upload } from 'lucide-react'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [summary, setSummary] = useState(null)
  const [trajectoryData, setTrajectoryData] = useState([])
  const [gpsData, setGpsData] = useState([])
  const [flightStat, setFlightStat] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selections, setSelections] = useState({
    altitudeUKF: true,
    altitudeGPS: true,
    speedUKF: true,
    speedGPS: true,
    roll: false,
    pitch: false,
    yaw: false,
  })

  const handleUploadSuccess = (id, dataSummary) => {
    setSessionId(id)
    setSummary(dataSummary)
    fetchAllData(id)
  }

  const fetchAllData = async (id) => {
    setLoading(true)
    setError(null)
    try {
      // Завантажуємо основну траєкторію
      const trajRes = await fetch(`http://localhost:8000/data/${id}/trajectory`)
      if (!trajRes.ok) throw new Error('Не вдалося отримати дані траєкторії')
      const trajData = await trajRes.json()
      setTrajectoryData(trajData)

      // Завантажуємо GPS дані (якщо доступні)
      try {
        const gpsRes = await fetch(`http://localhost:8000/data/${id}/gps.json`)
        if (gpsRes.ok) {
          const gpsDataJson = await gpsRes.json()
          setGpsData(gpsDataJson)
        }
      } catch (e) {
        console.warn('GPS дані не знайдені або недоступні', e)
      }

      // Завантажуємо стан польоту
      try {
        const statRes = await fetch(`http://localhost:8000/data/${id}/stat`)
        if (statRes.ok) {
          const statData = await statRes.json()
          setFlightStat(statData)
        }
      } catch (e) {
        console.warn('Стан польоту не знайдено', e)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (sessionId) {
      window.open(`http://localhost:8000/data/${sessionId}/uavlogviewer`, '_blank')
    }
  }

  const handleSelectionChange = (key) => {
    setSelections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasGps = gpsData && gpsData.length > 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>UAV UKF Trajectory</h1>
      </header>

      <aside className="left-bar">
        <div className="left-content">
          <h4>Навігація</h4>
          <ul>
            <li><Upload size={16} /> Завантаження</li>
            <li><BarChart3 size={16} /> Аналіз</li>
            <li><Database size={16} /> Дані</li>
          </ul>
        </div>
      </aside>

      <main className="app-body">
        <FileUploader onUploadSuccess={handleUploadSuccess} />

        {sessionId && (
          <div className="session-info">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <Database size={18} color="#3498db" />
                <strong>Session ID:</strong> <code style={{ backgroundColor: '#f0f0f0', padding: '2px 5px', borderRadius: '3px' }}>{sessionId}</code>
              </div>
              {summary && (
                <div style={{ display: 'flex', gap: '20px', color: '#666' }}>
                  <span><Activity size={14} style={{ marginRight: '4px' }} /> Точок: {summary.points}</span>
                  <span>Тривалість: {summary.duration_s}с</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleDownloadCSV}
              className="download-btn"
            >
              <Download size={18} /> Експорт CSV
            </button>
          </div>
        )}

        {error && (
          <div className="error-msg">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="animate-spin"></div>
            <p>Завантаження даних траєкторії...</p>
          </div>
        ) : (
          trajectoryData.length > 0 && <TrajectoryCharts data={trajectoryData} gpsData={gpsData} selections={selections} flightStat={flightStat} />
        )}
      </main>

      <aside className="right-bar">
        <div className="right-content">
          {flightStat && flightStat.length > 0 && (
            <div className="flight-legend-panel">
              <h4>Стани польоту</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#6b7280' }}></div>
                  <span>PAD_IDLE</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#dc2626' }}></div>
                  <span>BOOST</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#ea580c' }}></div>
                  <span>COAST</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#eab308' }}></div>
                  <span>APOGEE</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#2563eb' }}></div>
                  <span>DESCENT</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#16a34a' }}></div>
                  <span>LANDED</span>
                </div>
              </div>
            </div>
          )}
          <h4>Вибір даних для графіка</h4>
          <div className="selection-controls">
            <label>
              <input type="checkbox" checked={selections.altitudeUKF} onChange={() => handleSelectionChange('altitudeUKF')} />
              Altitude (UKF)
            </label>
            {hasGps && (
              <label>
                <input type="checkbox" checked={selections.altitudeGPS} onChange={() => handleSelectionChange('altitudeGPS')} />
                Altitude (GPS)
              </label>
            )}
            <label>
              <input type="checkbox" checked={selections.speedUKF} onChange={() => handleSelectionChange('speedUKF')} />
              Speed (UKF)
            </label>
            {hasGps && (
              <label>
                <input type="checkbox" checked={selections.speedGPS} onChange={() => handleSelectionChange('speedGPS')} />
                Speed (GPS)
              </label>
            )}
            <label>
              <input type="checkbox" checked={selections.roll} onChange={() => handleSelectionChange('roll')} />
              Roll
            </label>
            <label>
              <input type="checkbox" checked={selections.pitch} onChange={() => handleSelectionChange('pitch')} />
              Pitch
            </label>
            <label>
              <input type="checkbox" checked={selections.yaw} onChange={() => handleSelectionChange('yaw')} />
              Yaw
            </label>
          </div>
        </div>
      </aside>

      <footer className="app-footer">
        &copy; 2026 UKF Trajectory Processor
      </footer>
    </div>
  )
}

export default App
