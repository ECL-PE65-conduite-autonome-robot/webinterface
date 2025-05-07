import React from 'react'
import { Activity } from 'lucide-react'
import { RobotStats } from '../types'

interface StatsSectionProps {
  stats: RobotStats
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Statistiques en temps réel</h2>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Accélération X</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.acceleration.x} m/s²</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Accélération Y</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.acceleration.y} m/s²</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Accélération Z</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.acceleration.z} m/s²</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Vitesse</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.speed} m/s</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Position X</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.position.x} mm</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Position Y</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.position.y} mm</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Position Z</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.position.z} mm</p>
          </div>
        </div>
      </div>
    </section>
  )
}