import { useEffect, useMemo, useState } from 'react'
import './App.css'
import FileUploader from './components/FileUploader'
import TrajectoryCharts from './components/TrajectoryCharts'
import {
  Activity,
  AlertCircle,
  BarChart3,
  Database,
  Download,
  Gauge,
  Moon,
  Radar,
  Sparkles,
  SunMedium,
  Waves,
} from 'lucide-react'

const defaultSelections = {
  altitudeUKF: true,
  altitudeGPS: true,
  speedUKF: true,
  speedGPS: true,
  roll: false,
  pitch: false,
  yaw: false,
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('trajectory-theme') || 'light')
  const [sessionId, setSessionId] = useState(null)
  const [summary, setSummary] = useState(null)
  const [trajectoryData, setTrajectoryData] = useState([])
  const [gpsData, setGpsData] = useState([])
  const [flightStat, setFlightStat] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selections, setSelections] = useState(defaultSelections)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('trajectory-theme', theme)
  }, [theme])

  const handleUploadSuccess = (id, dataSummary) => {
    setSessionId(id)
    setSummary(dataSummary)
    fetchAllData(id)
  }

  const fetchAllData = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const trajRes = await fetch(`http://localhost:8000/data/${id}/trajectory`)
      if (!trajRes.ok) throw new Error('Не вдалося отримати дані траєкторії')
      const trajData = await trajRes.json()
      setTrajectoryData(trajData)

      try {
        const gpsRes = await fetch(`http://localhost:8000/data/${id}/gps.json`)
        if (gpsRes.ok) {
          const gpsDataJson = await gpsRes.json()
          setGpsData(gpsDataJson)
        } else {
          setGpsData([])
        }
      } catch (gpsError) {
        console.warn('GPS дані недоступні', gpsError)
        setGpsData([])
      }

      try {
        const statRes = await fetch(`http://localhost:8000/data/${id}/stat`)
        if (statRes.ok) {
          const statData = await statRes.json()
          setFlightStat(statData)
        } else {
          setFlightStat([])
        }
      } catch (statError) {
        console.warn('Стани польоту недоступні', statError)
        setFlightStat([])
      }
    } catch (requestError) {
      setError(requestError.message)
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
    setSelections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const applyPreset = (preset) => {
    if (preset === 'base') {
      setSelections({
        altitudeUKF: true,
        altitudeGPS: true,
        speedUKF: true,
        speedGPS: true,
        roll: false,
        pitch: false,
        yaw: false,
      })
      return
    }

    if (preset === 'angles') {
      setSelections({
        altitudeUKF: false,
        altitudeGPS: false,
        speedUKF: false,
        speedGPS: false,
        roll: true,
        pitch: true,
        yaw: true,
      })
      return
    }

    setSelections({
      altitudeUKF: true,
      altitudeGPS: true,
      speedUKF: true,
      speedGPS: true,
      roll: true,
      pitch: true,
      yaw: true,
    })
  }

  const hasGps = gpsData.length > 0
  const hasTrajectory = trajectoryData.length > 0

  const derivedStats = useMemo(() => {
    if (!hasTrajectory) {
      return {
        maxAltitude: '0 м',
        maxSpeed: '0 м/с',
        samples: '0',
      }
    }

    const maxAltitude = Math.max(...trajectoryData.map((point) => Number(point.alt_m) || 0))
    const maxSpeed = Math.max(
        ...trajectoryData.map((point) =>
            Math.sqrt((point.vN || 0) ** 2 + (point.vE || 0) ** 2 + (point.vD || 0) ** 2),
        ),
    )

    return {
      maxAltitude: `${maxAltitude.toFixed(1)} м`,
      maxSpeed: `${maxSpeed.toFixed(1)} м/с`,
      samples: Intl.NumberFormat('uk-UA').format(trajectoryData.length),
    }
  }, [hasTrajectory, trajectoryData])

  const flightLegend = (
      <section className="side-panel side-panel-accent">
        <div className="panel-heading">
          <span className="panel-kicker">Навпроти 3D графіка</span>
          <h3>Легенда польоту</h3>
        </div>
        <p className="panel-text">
          Кольори відповідають фазам місії та збігаються з 3D-траєкторією.
        </p>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#6b7280' }} />
            <span>PAD_IDLE</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#dc2626' }} />
            <span>BOOST</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ea580c' }} />
            <span>COAST</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#eab308' }} />
            <span>APOGEE</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#2563eb' }} />
            <span>DESCENT</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#16a34a' }} />
            <span>LANDED</span>
          </div>
        </div>
        <div className="mini-note">
          <Sparkles size={16} />
          <span>Керування 3D: колесо миші масштабує, перетягування обертає сцену.</span>
        </div>
      </section>
  )

  const selectionPanel = (
      <section className="side-panel">
        <div className="panel-heading">
          <span className="panel-kicker">Навпроти 2D графіка</span>
          <h3>Вибір даних для графіка</h3>
        </div>
        <p className="panel-text">
          Можна швидко перемикати профілі відображення і порівнювати UKF з GPS.
        </p>

        <div className="preset-row">
          <button className="chip-btn" onClick={() => applyPreset('base')} type="button">
            Базовий набір
          </button>
          <button className="chip-btn" onClick={() => applyPreset('angles')} type="button">
            Орієнтація
          </button>
          <button className="chip-btn" onClick={() => applyPreset('all')} type="button">
            Усе
          </button>
        </div>

        <div className="selection-controls">
          <label>
            <input
                type="checkbox"
                checked={selections.altitudeUKF}
                onChange={() => handleSelectionChange('altitudeUKF')}
            />
            Altitude (UKF)
          </label>
          {hasGps && (
              <label>
                <input
                    type="checkbox"
                    checked={selections.altitudeGPS}
                    onChange={() => handleSelectionChange('altitudeGPS')}
                />
                Altitude (GPS)
              </label>
          )}
          <label>
            <input
                type="checkbox"
                checked={selections.speedUKF}
                onChange={() => handleSelectionChange('speedUKF')}
            />
            Speed (UKF)
          </label>
          {hasGps && (
              <label>
                <input
                    type="checkbox"
                    checked={selections.speedGPS}
                    onChange={() => handleSelectionChange('speedGPS')}
                />
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

        <div className="mini-note">
          <Waves size={16} />
          <span>На 2D-графіку доступний зум, range slider та швидкі часові інтервали.</span>
        </div>
      </section>
  )

  return (
      <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
        <div className="app-background" />

        <header className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow">
              <Radar size={16} />
              <span>Sensor Fusion Dashboard</span>
            </div>
            <h1>Панель аналізу траєкторії БпЛА</h1>
            <p>
              Оновлений інтерфейс для читабельного порівняння 3D маршруту, 2D часових рядів та фаз
              польоту без візуального хаосу.
            </p>
          </div>

          <div className="hero-actions">
            <button
                type="button"
                className="theme-toggle"
                onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Світла тема' : 'Темна тема'}</span>
            </button>

            <div className="status-card">
              <span className="status-label">Статус сесії</span>
              <strong>{sessionId ? 'Дані завантажено' : 'Очікується файл .BIN'}</strong>
            </div>
          </div>
        </header>

        <main className="app-main">
          <section className="top-strip">
            <article className="info-card">
              <Database size={20} />
              <div>
                <span>ID сесії</span>
                <strong>{sessionId || 'ще не створено'}</strong>
              </div>
            </article>
            <article className="info-card">
              <Activity size={20} />
              <div>
                <span>Тривалість</span>
                <strong>{summary ? `${summary.duration_s} с` : '—'}</strong>
              </div>
            </article>
            <article className="info-card">
              <Gauge size={20} />
              <div>
                <span>Макс. швидкість</span>
                <strong>{derivedStats.maxSpeed}</strong>
              </div>
            </article>
            <article className="info-card">
              <BarChart3 size={20} />
              <div>
                <span>Точки / висота</span>
                <strong>
                  {derivedStats.samples} / {derivedStats.maxAltitude}
                </strong>
              </div>
            </article>
          </section>

          <FileUploader onUploadSuccess={handleUploadSuccess} />

          {sessionId && (
              <section className="session-banner">
                <div>
                  <span className="session-badge">Активна сесія</span>
                  <h2>{sessionId}</h2>
                  <p>
                    {summary
                        ? `${summary.points} точок телеметрії, ${
                            hasGps ? 'GPS синхронізовано' : 'GPS відсутній'
                        }, стани польоту ${flightStat.length > 0 ? 'підключено' : 'недоступні'}.`
                        : 'Дані телеметрії вже завантажені й готові до аналізу.'}
                  </p>
                </div>

                <button onClick={handleDownloadCSV} className="download-btn" type="button">
                  <Download size={18} />
                  Експорт CSV
                </button>
              </section>
          )}

          {error && (
              <div className="error-msg">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
          )}

          {loading ? (
              <div className="loading-panel">
                <div className="animate-spin loader-ring" />
                <h3>Обробляємо телеметрію</h3>
                <p>Завантажуємо траєкторію, GPS і стани польоту для побудови графіків.</p>
              </div>
          ) : null}

          {!loading && hasTrajectory && (
              <TrajectoryCharts
                  data={trajectoryData}
                  gpsData={gpsData}
                  selections={selections}
                  flightStat={flightStat}
                  theme={theme}
                  legendPanel={flightLegend}
                  controlPanel={selectionPanel}
              />
          )}

          {!loading && !hasTrajectory && !error && (
              <section className="empty-state">
                <Radar size={34} />
                <h3>Підготуйте телеметрію для візуалізації</h3>
                <p>
                  Завантажте `.BIN` файл, після чого панель автоматично побудує 3D маршрут, 2D графік
                  та синхронізовані допоміжні панелі.
                </p>
              </section>
          )}
        </main>

        <footer className="app-footer">© 2026 UKF Trajectory Processor</footer>
      </div>
  )
}

export default App
