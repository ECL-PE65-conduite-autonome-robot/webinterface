import React from 'react'
import { LineChart as ChartIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { GraphType } from '../types'

interface GraphSectionProps {
  selectedGraph: GraphType
  setSelectedGraph: (type: GraphType) => void
}

export function GraphSection({ selectedGraph, setSelectedGraph }: GraphSectionProps) {
  const generateTimeData = (dataKey: string) => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: i,
      [dataKey]: Math.sin(i * 0.5) * 3 + 5 + Math.random() * 0.5,
    }))
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ChartIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Graphiques</h2>
        </div>
        <select
          value={selectedGraph}
          onChange={(e) => setSelectedGraph(e.target.value as GraphType)}
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2"
        >
          <option value="speed">Vitesse</option>
          <option value="acceleration">Accélération</option>
          <option value="position">Position</option>
        </select>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={generateTimeData(selectedGraph)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: 'Temps (s)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: selectedGraph === 'speed' ? 'm/s' : selectedGraph === 'acceleration' ? 'm/s²' : 'mm', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey={selectedGraph} stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}