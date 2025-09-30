'use client'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = Array.from({ length: 30 }).map((_, i) => ({
  name: `${i}`,
  value: 500 + Math.round(Math.sin(i / 3) * 200 + Math.random() * 150),
}))

export default function TinyChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff5533" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#ff5533" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip contentStyle={{ background: '#151517', border: '1px solid #262629' }} />
        <Area type="monotone" dataKey="value" stroke="#ff5533" fillOpacity={1} fill="url(#color)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}


