import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

function EnergyPieChart({ data, title, cleanEnergyPercent }) {
    const colors = {
        gas: '#FF6B6B',
        coal: '#4A4A4A',
        biomass: '#51CF66',
        nuclear: '#4DABF7',
        hydro: '#339AF0',
        imports: '#FFA94D',
        other: '#868E96',
        wind: '#94D82D',
        solar: '#FFD43B'
    };

    const chartData = Object.entries(data)
        .filter(([key]) => key !== 'cleanEnergyPercent')
        .map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2))
        }))
        .filter(item => item.value > 0);

    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, value, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 30;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" >
                {`${name}: ${value}%`}
            </text>
        );
    };

    return (
        <div style={{ textAlign: 'center', marginBottom: '40px', width: '100%' }}>
            <div style={{ backgroundColor: '#E7F5FF', padding: '10px 20px', borderRadius: '12px',
                    marginBottom: '20px', fontWeight: 'bold', display: 'inline-block', color: '#1971c2',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                {title}<br/> Clean Energy: {cleanEnergyPercent.toFixed(2)}%
            </div>

            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="200%" height="100%">
                    <PieChart margin={{ top: 30, right: 60, bottom: 30, left: 60 }}>
                        <Pie data={chartData} cx="50%" cy="50%" labelLine={true} label={renderCustomizedLabel}
                                outerRadius={80} fill="#8884d8" dataKey="value" isAnimationActive={false} paddingAngle={1} >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[entry.name.toLowerCase()]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default EnergyPieChart;