import React from 'react'
import plotComponentFactory from 'react-plotly.js/factory'
import Plotly from 'plotly.js-dist-min'
import { Crosshair, Mountain, Timer } from 'lucide-react'
import styles from './TrajectoryCharts.module.css'

const Plot = (plotComponentFactory.default || plotComponentFactory)(Plotly)

const getThemePalette = (theme) =>
    theme === 'dark'
        ? {
          paper: '#0f172a',
          panel: '#111c31',
          grid: 'rgba(148, 163, 184, 0.18)',
          text: '#e2e8f0',
          subtle: '#9fb0ca',
        }
        : {
          paper: '#ffffff',
          panel: '#f8fbff',
          grid: 'rgba(148, 163, 184, 0.26)',
          text: '#172033',
          subtle: '#64748b',
        }

const TrajectoryCharts = ({
                            data,
                            gpsData,
                            selections,
                            flightStat,
                            theme,
                            legendPanel,
                            controlPanel,
                          }) => {
  if (!data || data.length === 0) return null

  const palette = getThemePalette(theme)
  const time = data.map((point) => point.time_s)

  const stateColors = {
    1: '#6b7280',
    2: '#dc2626',
    3: '#ea580c',
    4: '#eab308',
    5: '#2563eb',
    6: '#16a34a',
  }

  const stateNames = {
    1: 'PAD_IDLE',
    2: 'BOOST',
    3: 'COAST',
    4: 'APOGEE',
    5: 'DESCENT',
    6: 'LANDED',
  }

  const plotlyData3D = []

  if (flightStat && Array.isArray(flightStat) && flightStat.length > 0) {
    const statMap = new Map()
    flightStat.forEach((stat) => {
      if (stat && stat.time_s !== undefined && stat.Stage !== undefined) {
        const roundedTime = Math.round(stat.time_s * 1000) / 1000
        statMap.set(roundedTime, parseInt(stat.Stage, 10) || 1)
      }
    })

    let currentState = 1
    let segment = { x: [], y: [], z: [] }

    data.forEach((point) => {
      const roundedTime = Math.round(point.time_s * 1000) / 1000
      const newState = statMap.get(roundedTime)

      if (newState !== undefined && newState !== currentState) {
        if (segment.x.length > 0) {
          plotlyData3D.push({
            x: segment.x,
            y: segment.y,
            z: segment.z,
            mode: 'lines',
            type: 'scatter3d',
            name: stateNames[currentState] || `State ${currentState}`,
            line: { color: stateColors[currentState] || '#3498db', width: 4 },
            showlegend: false,
          })
        }

        segment = { x: [], y: [], z: [] }
        currentState = newState
      }

      segment.x.push(point.pE)
      segment.y.push(point.pN)
      segment.z.push(point.alt_m)
    })

    if (segment.x.length > 0) {
      plotlyData3D.push({
        x: segment.x,
        y: segment.y,
        z: segment.z,
        mode: 'lines',
        type: 'scatter3d',
        name: stateNames[currentState] || `State ${currentState}`,
        line: { color: stateColors[currentState] || '#3498db', width: 4 },
        showlegend: false,
      })
    }
  } else {
    plotlyData3D.push({
      x: data.map((point) => point.pE),
      y: data.map((point) => point.pN),
      z: data.map((point) => point.alt_m),
      mode: 'lines',
      type: 'scatter3d',
      name: 'UKF Trajectory',
      line: { color: '#3498db', width: 4 },
      showlegend: false,
    })
  }

  const hasGps = gpsData && gpsData.length > 0

  if (hasGps) {
    const firstGps = gpsData[0]
    const firstUkf = data[0]
    const latToM = 111132.92
    const lonToM = 111319.48 * Math.cos((firstGps.lat * Math.PI) / 180)

    plotlyData3D.push({
      x: gpsData.map((point) => (point.lon - firstGps.lon) * lonToM + (firstUkf.pE || 0)),
      y: gpsData.map((point) => (point.lat - firstGps.lat) * latToM + (firstUkf.pN || 0)),
      z: gpsData.map((point) => point.alt),
      mode: 'lines',
      type: 'scatter3d',
      name: 'GPS Trajectory',
      line: { color: '#f59e0b', width: 3 },
    })
  }

  const plotlyData2D = []

  if (selections.altitudeUKF) {
    plotlyData2D.push({
      x: time,
      y: data.map((point) => point.alt_m),
      mode: 'lines',
      name: 'Altitude (UKF)',
      line: { color: '#2563eb', width: 2.5 },
    })
  }

  if (selections.altitudeGPS && hasGps) {
    plotlyData2D.push({
      x: gpsData.map((point) => point.time_s),
      y: gpsData.map((point) => point.alt),
      mode: 'lines',
      name: 'Altitude (GPS)',
      line: { color: '#f59e0b', width: 2, dash: 'dot' },
    })
  }

  if (selections.speedUKF) {
    plotlyData2D.push({
      x: time,
      y: data.map((point) => Math.sqrt((point.vN || 0) ** 2 + (point.vE || 0) ** 2 + (point.vD || 0) ** 2)),
      mode: 'lines',
      name: 'Speed (UKF)',
      line: { color: '#10b981', width: 2.2 },
    })
  }

  if (selections.speedGPS && hasGps) {
    plotlyData2D.push({
      x: gpsData.map((point) => point.time_s),
      y: gpsData.map((point) => point.spd),
      mode: 'lines',
      name: 'Speed (GPS)',
      line: { color: '#ef4444', width: 2, dash: 'dot' },
    })
  }

  if (selections.roll) {
    plotlyData2D.push({
      x: time,
      y: data.map((point) => point.roll_deg),
      mode: 'lines',
      name: 'Roll',
      line: { color: '#f97316', width: 2 },
    })
  }

  if (selections.pitch) {
    plotlyData2D.push({
      x: time,
      y: data.map((point) => point.pitch_deg),
      mode: 'lines',
      name: 'Pitch',
      line: { color: '#22c55e', width: 2 },
    })
  }

  if (selections.yaw) {
    plotlyData2D.push({
      x: time,
      y: data.map((point) => point.yaw_deg),
      mode: 'lines',
      name: 'Yaw',
      line: { color: '#8b5cf6', width: 2 },
    })
  }

  const maxAltitude = Math.max(...data.map((point) => Number(point.alt_m) || 0))
  const flightTime = time.length > 0 ? time[time.length - 1] : 0
  const maxDistance = Math.max(
      ...data.map((point) => Math.sqrt((point.pE || 0) ** 2 + (point.pN || 0) ** 2)),
  )

  return (
      <section className={styles.dashboardSection}>
        <div className={styles.row}>
          <article className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.kicker}>Просторова модель</span>
                <h3>3D графік траєкторії</h3>
              </div>

              <div className={styles.metricGroup}>
                <div className={styles.metricPill}>
                  <Mountain size={15} />
                  <span>{maxAltitude.toFixed(1)} м</span>
                </div>
                <div className={styles.metricPill}>
                  <Crosshair size={15} />
                  <span>{maxDistance.toFixed(1)} м</span>
                </div>
              </div>
            </div>

            <Plot
                data={plotlyData3D}
                layout={{
                  autosize: true,
                  height: 620,
                  paper_bgcolor: palette.paper,
                  plot_bgcolor: palette.panel,
                  font: { color: palette.text, family: 'Manrope, Segoe UI, sans-serif' },
                  margin: { l: 0, r: 0, b: 0, t: 10 },
                  showlegend: false,
                  scene: {
                    bgcolor: palette.panel,
                    camera: { eye: { x: 1.45, y: 1.45, z: 0.9 } },
                    xaxis: {
                      title: 'East (m)',
                      color: palette.text,
                      gridcolor: palette.grid,
                      zerolinecolor: palette.grid,
                      backgroundcolor: palette.panel,
                    },
                    yaxis: {
                      title: 'North (m)',
                      color: palette.text,
                      gridcolor: palette.grid,
                      zerolinecolor: palette.grid,
                      backgroundcolor: palette.panel,
                    },
                    zaxis: {
                      title: 'Altitude (m)',
                      color: palette.text,
                      gridcolor: palette.grid,
                      zerolinecolor: palette.grid,
                      backgroundcolor: palette.panel,
                    },
                  },
                }}
                config={{
                  responsive: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                }}
                useResizeHandler
                className={styles.plot}
                style={{ width: '100%', height: '100%' }}
            />
          </article>

          <div className={styles.sideColumn}>{legendPanel}</div>
        </div>

        <div className={styles.row}>
          <article className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.kicker}>Часові ряди</span>
                <h3>2D графік телеметрії</h3>
              </div>

              <div className={styles.metricGroup}>
                <div className={styles.metricPill}>
                  <Timer size={15} />
                  <span>{flightTime.toFixed(1)} с</span>
                </div>
                <div className={styles.metricPill}>
                  <Crosshair size={15} />
                  <span>{plotlyData2D.length} серій</span>
                </div>
              </div>
            </div>

            <Plot
                data={plotlyData2D}
                layout={{
                  autosize: true,
                  height: 520,
                  paper_bgcolor: palette.paper,
                  plot_bgcolor: palette.panel,
                  font: { color: palette.text, family: 'Manrope, Segoe UI, sans-serif' },
                  margin: { l: 58, r: 18, b: 96, t: 16 },
                  hovermode: 'x unified',
                  xaxis: {
                    title: 'Час (с)',
                    color: palette.text,
                    gridcolor: palette.grid,
                    zerolinecolor: palette.grid,
                    rangeslider: {
                      visible: true,
                      bgcolor: palette.panel,
                      bordercolor: palette.grid,
                    },
                    rangeselector: {
                      bgcolor: palette.paper,
                      activecolor: palette.panel,
                      buttons: [
                        { count: 10, label: '10с', step: 'second', stepmode: 'backward' },
                        { count: 30, label: '30с', step: 'second', stepmode: 'backward' },
                        { count: 60, label: '1хв', step: 'second', stepmode: 'backward' },
                        { count: 300, label: '5хв', step: 'second', stepmode: 'backward' },
                        { step: 'all', label: 'Усе' },
                      ],
                    },
                  },
                  yaxis: {
                    title: 'Значення',
                    color: palette.text,
                    gridcolor: palette.grid,
                    zerolinecolor: palette.grid,
                  },
                  legend: {
                    orientation: 'h',
                    x: 0,
                    y: 1.14,
                    font: { color: palette.subtle },
                  },
                }}
                config={{
                  responsive: true,
                  displaylogo: false,
                }}
                useResizeHandler
                className={styles.plot}
                style={{ width: '100%', height: '100%' }}
            />
          </article>

          <div className={styles.sideColumn}>{controlPanel}</div>
        </div>
      </section>
  )
}

export default TrajectoryCharts
