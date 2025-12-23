import { useState, useEffect, useRef } from 'react'
import EnergyPieChart from './components/EnergyPieChart'
import './App.css'

function App() {
    const [energyMixData, setEnergyMixData] = useState(null);
    const [chargingWindow, setChargingWindow] = useState(null);
    const [hours, setHours] = useState(3);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const resultDiv = useRef(null);

    useEffect(() => {
        fetchEnergyMix();
    }, []);

    const fetchEnergyMix = async () => {
        setLoading(true);

        await fetch('/energy-mix', {
            method: "GET"
        })
        .then(async res => {
            const data = await res.json();
            
            if (res.ok) {
                setEnergyMixData(data);
            }
            else
                throw new Error(`Failed to fetch energy mix data`);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    };

    const fetchOptimalWindow = async () => {
        setLoading(true);

        await fetch(`/optimal-charging-window?hours=${hours}`, {
            method: "GET"
        })
        .then(async res => {
            const data = await res.json();

            if (res.ok) {
                setChargingWindow(data);

                setTimeout(() => {
                    if (resultDiv.current != null) {
                        resultDiv.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'end',
                        });
                    }
                }, 10);
            } else
                throw new Error('Failed to fetch optimal charging window');
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    };

    if (loading && !energyMixData) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center',
                alignItems: 'center', height: '100vh', fontSize: '20px'
            }}>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
                Error: {error}
            </div>
        );
    }

    const getDayLabel = (id) => {
        const labels = ['Today', 'Tomorrow', 'Day After Tomorrow'];
        return labels[id];
    };

    return (
        <div className="dashboard">
            <h1 className="dashboard-title">Energy Mix Dashboard</h1>

            <div className="main-content">
                {/* Pie charts */}
                <div className="charts-section">
                    {energyMixData?.days?.map((day, index) => {
                        const averages = typeof day.averages === 'string'
                            ? JSON.parse(day.averages)
                            : day.averages;

                        return (
                            <EnergyPieChart key={day.date} data={averages} title={`${getDayLabel(index)} (${day.date})`}
                                cleanEnergyPercent={averages.cleanEnergyPercent} /> );
                    })}
                </div>

                {/* Optimal charging window */}
                <div className="sidebar">
                    <div className="charging-window-card">
                        <h2 className="section-title">Find Optimal Charging Window</h2>

                        <div className="input-section">
                            <label htmlFor="hours" className="input-label">
                                Charging Duration (hours):
                            </label>
                            <input id="hours" type="number" min="1" max="6" value={hours}
                                onChange={(e) => setHours(parseInt(e.target.value))} className="hours-input" />
                        </div>

                        <button onClick={fetchOptimalWindow} disabled={loading} className="submit-button" >
                            {loading ? 'Calculating...' : 'Find Optimal Window'}
                        </button>

                        {chargingWindow && (
                            <div ref={resultDiv} className="result-card">
                                <h3 className="result-title">Optimal Charging Window Found!</h3>
                                <div className="result-content">
                                    <p>
                                        <strong>Start Time:</strong>{' '}
                                        {new Date(chargingWindow.optimalWindow.startTime).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>End Time:</strong>{' '}
                                        {new Date(chargingWindow.optimalWindow.endTime).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Average Clean Energy:</strong>{' '}
                                        <span className="clean-energy-percent">
                                            {chargingWindow.optimalWindow.averageCleanEnergyPercent}%
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App
