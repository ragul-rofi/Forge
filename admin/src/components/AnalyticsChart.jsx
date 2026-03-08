import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function AnalyticsChart({
  type = 'bar',
  data = [],
  title,
  dataKeys = [],
  colors = [],
  xKey = 'name',
  height = 300,
}) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--text)',
    },
  }

  return (
    <div className="card p-5">
      {title && (
        <h4 className="font-mono text-xs tracking-wider mb-4" style={{ color: 'var(--muted)' }}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xKey} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i] || 'var(--accent)'} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        )}
        {type === 'line' && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xKey} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            {dataKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[i] || 'var(--accent)'}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        )}
        {type === 'pie' && (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKeys[0] || 'value'}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              innerRadius={height / 5}
              stroke="var(--bg)"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length] || 'var(--accent)'} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend
              formatter={(value) => (
                <span style={{ color: 'var(--muted2)', fontSize: 11 }}>{value}</span>
              )}
            />
          </PieChart>
        )}
        {type === 'radar' && (
          <RadarChart data={data} cx="50%" cy="50%" outerRadius={height / 3}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey={xKey} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} />
            {dataKeys.map((key, i) => (
              <Radar
                key={key}
                dataKey={key}
                stroke={colors[i] || 'var(--accent)'}
                fill={colors[i] || 'var(--accent)'}
                fillOpacity={0.2}
              />
            ))}
            <Tooltip {...tooltipStyle} />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
