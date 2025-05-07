import React from 'react'
import { Play, Pause, Square, Settings } from 'lucide-react'
import { OperationMode, RobotStatus } from '../types'

interface HeaderProps {
  mode: OperationMode
  setMode: (mode: OperationMode) => void
  status: RobotStatus
  onStart: () => void
  onPause: () => void
  onStop: () => void
}

export function Header({ mode, setMode, status, onStart, onPause, onStop }: HeaderProps) {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Orinx Pro Control</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <select
            value={mode}
            onChange={(e) => setMode(parseInt(e.target.value) as OperationMode)}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0">Mode Manuel</option>
            <option value="1">Mode Autonome</option>
            <option value="2">Mode Debugging</option>
          </select>

          <div className="flex space-x-2">
            <button
              onClick={onStart}
              disabled={status === RobotStatus.RUNNING}
              className="p-2 rounded-full hover:bg-green-100 disabled:opacity-50"
              title="Démarrer"
            >
              <Play className="w-6 h-6 text-green-600" />
            </button>
            <button
              onClick={onPause}
              disabled={status === RobotStatus.PAUSED || status === RobotStatus.STOPPED}
              className="p-2 rounded-full hover:bg-yellow-100 disabled:opacity-50"
              title="Pause"
            >
              <Pause className="w-6 h-6 text-yellow-600" />
            </button>
            <button
              onClick={onStop}
              disabled={status === RobotStatus.STOPPED}
              className="p-2 rounded-full hover:bg-red-100 disabled:opacity-50"
              title="Arrêter"
            >
              <Square className="w-6 h-6 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}