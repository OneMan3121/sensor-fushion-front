import React from 'react';
import plotComponentFactory from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
import styles from './TrajectoryCharts.module.css';

const Plot = (plotComponentFactory.default || plotComponentFactory)(Plotly);

const TrajectoryCharts = ({ data, gpsData, selections, flightStat }) => {
  if (!data || data.length === 0) return null;

  const time = data.map(d => d.time_s);
  
  // Colors and names for flight states
  const stateColors = {
    1: '#6b7280', // PAD_IDLE - gray
    2: '#dc2626', // BOOST - red
    3: '#ea580c', // COAST - orange
    4: '#eab308', // APOGEE - yellow
    5: '#2563eb', // DESCENT - blue
    6: '#16a34a'  // LANDED - green
  };

  const stateNames = {
    1: 'PAD_IDLE',
    2: 'BOOST',
    3: 'COAST',
    4: 'APOGEE',
    5: 'DESCENT',
    6: 'LANDED'
  };

  // Create segmented traces for UKF trajectory based on flight state
  const plotlyData3D = [];
  if (flightStat && Array.isArray(flightStat) && flightStat.length > 0 && data && data.length > 0) {
    // Create a map of time_s to stage for quick lookup (round to 3 decimal places to handle floating point precision)
    const statMap = new Map();
    flightStat.forEach(stat => {
      if (stat && stat.time_s !== undefined && stat.Stage !== undefined) {
        const roundedTime = Math.round(stat.time_s * 1000) / 1000; // Round to 3 decimal places
        statMap.set(roundedTime, parseInt(stat.Stage) || 1);
      }
    });

    let currentState = 1; // Default starting state
    let segment = { x: [], y: [], z: [] };

    data.forEach((point, index) => {
      const roundedTime = Math.round(point.time_s * 1000) / 1000; // Round to 3 decimal places
      const newState = statMap.get(roundedTime);

      // Only change state if we have a new value for this time
      if (newState !== undefined && newState !== currentState) {
        // Push current segment before changing state
        if (segment.x.length > 0) {
          plotlyData3D.push({
            x: segment.x,
            y: segment.y,
            z: segment.z,
            mode: 'lines',
            type: 'scatter3d',
            name: stateNames[currentState] || `State ${currentState}`,
            line: { color: stateColors[currentState] || '#3498db', width: 4 },
            showlegend: false
          });
        }
        segment = { x: [], y: [], z: [] };
        currentState = newState;
      }

      // Always add point to current segment
      segment.x.push(point.pE);
      segment.y.push(point.pN);
      segment.z.push(point.alt_m);
    });

    // Push the last segment
    if (segment.x.length > 0) {
      plotlyData3D.push({
        x: segment.x,
        y: segment.y,
        z: segment.z,
        mode: 'lines',
        type: 'scatter3d',
        name: stateNames[currentState] || `State ${currentState}`,
        line: { color: stateColors[currentState] || '#3498db', width: 4 },
        showlegend: false
      });
    }

    // If no segments were created (shouldn't happen), create one
    if (plotlyData3D.length === 0) {
      plotlyData3D.push({
        x: data.map(d => d.pE),
        y: data.map(d => d.pN),
        z: data.map(d => d.alt_m),
        mode: 'lines',
        type: 'scatter3d',
        name: 'UKF Trajectory',
        line: { color: '#3498db', width: 4 },
        showlegend: false
      });
    }
  } else {
    // Fallback to single trace if no flight stat
    plotlyData3D.push({
      x: data.map(d => d.pE),
      y: data.map(d => d.pN),
      z: data.map(d => d.alt_m),
      mode: 'lines',
      type: 'scatter3d',
      name: 'UKF Trajectory',
      line: { color: '#3498db', width: 4 },
      showlegend: false
    });
  }

  // 3D Траєкторія GPS (якщо є)
  const hasGps = gpsData && gpsData.length > 0;
  
  if (hasGps) {
    const firstGps = gpsData[0];
    const firstUkf = data[0];
    
    const latToM = 111132.92;
    const lonToM = 111319.48 * Math.cos(firstGps.lat * Math.PI / 180);

    const traceGps3D = {
      x: gpsData.map(d => (d.lon - firstGps.lon) * lonToM + (firstUkf.pE || 0)),
      y: gpsData.map(d => (d.lat - firstGps.lat) * latToM + (firstUkf.pN || 0)),
      z: gpsData.map(d => d.alt),
      mode: 'lines',
      type: 'scatter3d',
      name: 'GPS Trajectory',
      line: { 
        color: '#e67e22', 
        width: 3
      }
    };
    plotlyData3D.push(traceGps3D);
  }

  // Build 2D data based on selections
  const plotlyData2D = [];

  if (selections.altitudeUKF) {
    plotlyData2D.push({
      x: time,
      y: data.map(d => d.alt_m),
      mode: 'lines',
      name: 'Altitude (UKF)',
      line: { color: '#3498db' }
    });
  }

  if (selections.altitudeGPS && hasGps) {
    plotlyData2D.push({
      x: gpsData.map(d => d.time_s),
      y: gpsData.map(d => d.alt),
      mode: 'lines',
      name: 'Altitude (GPS)',
      line: { color: '#e67e22', width: 2, dash: 'dot' }
    });
  }

  if (selections.speedUKF) {
    plotlyData2D.push({
      x: time,
      y: data.map(d => Math.sqrt((d.vN || 0)**2 + (d.vE || 0)**2 + (d.vD || 0)**2)),
      mode: 'lines',
      name: 'Speed (UKF)',
      line: { color: '#2ecc71', width: 2 }
    });
  }

  if (selections.speedGPS && hasGps) {
    plotlyData2D.push({
      x: gpsData.map(d => d.time_s),
      y: gpsData.map(d => d.spd),
      mode: 'lines',
      name: 'Speed (GPS)',
      line: { color: '#f1c40f', width: 2, dash: 'dot' }
    });
  }

  if (selections.roll) {
    plotlyData2D.push({ x: time, y: data.map(d => d.roll_deg), name: 'Roll', line: { color: 'red' } });
  }

  if (selections.pitch) {
    plotlyData2D.push({ x: time, y: data.map(d => d.pitch_deg), name: 'Pitch', line: { color: 'green' } });
  }

  if (selections.yaw) {
    plotlyData2D.push({ x: time, y: data.map(d => d.yaw_deg), name: 'Yaw', line: { color: 'blue' } });
  }

  return (
    <div className={styles.chartsContainer}>
      <div className={styles.chartsMain}>
        <div className={styles.chartBox}>
          <h3>3D Траєкторія (East-North-Alt)</h3>
          <Plot
            data={plotlyData3D}
            layout={{
              width: undefined,
              height: 600,
              autosize: true,
              scene: {
                xaxis: { title: 'East (m)' },
                yaxis: { title: 'North (m)' },
                zaxis: { title: 'Altitude (m)' },
              },
              margin: { l: 0, r: 0, b: 0, t: 30 },
              showlegend: false // Disable Plotly legend since we have custom
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div className={styles.chartBox}>
          <h3>2D Графік</h3>
          <Plot
            data={plotlyData2D}
            layout={{ 
                autosize: true, 
                height: 500, 
                margin: { l: 50, r: 20, b: 120, t: 40 },
                xaxis: { 
                  title: 'Час (с)',
                  rangeslider: { visible: true },
                  rangeselector: {
                    buttons: [
                      { count: 10, label: '10s', step: 'second', stepmode: 'backward' },
                      { count: 30, label: '30s', step: 'second', stepmode: 'backward' },
                      { count: 60, label: '1m', step: 'second', stepmode: 'backward' },
                      { count: 300, label: '5m', step: 'second', stepmode: 'backward' },
                      { step: 'all', label: 'All' }
                    ]
                  }
                },
                yaxis: { title: 'Значення' },
                legend: { orientation: 'h', y: 1.1 }
            }}
            useResizeHandler={true}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrajectoryCharts;
