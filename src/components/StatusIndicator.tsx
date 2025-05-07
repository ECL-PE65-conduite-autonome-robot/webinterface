import { RobotStatus } from '../types'

interface StatusIndicatorProps {
  status: RobotStatus
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <div className="fixed bottom-4 right-4">
      <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${
            status === RobotStatus.RUNNING
              ? 'bg-green-500'
              : status === RobotStatus.PAUSED
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium text-gray-700">
          {status === RobotStatus.RUNNING
            ? 'En fonctionnement'
            : status === RobotStatus.PAUSED
            ? 'En pause'
            : 'Arrêté'}
        </span>
      </div>
    </div>
  )
}