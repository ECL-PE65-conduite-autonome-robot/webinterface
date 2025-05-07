import React from 'react'

interface ControlPanelProps {
  onMove: (direction: 'forward' | 'backward' | 'left' | 'right' | 'turn_left' | 'turn_right' | 'stop') => void
  disabled?: boolean
}

const arrowIcons = {
  forward: '↑',
  backward: '↓',
  left: '←',
  right: '→',
  turn_left: '⟲',
  turn_right: '⟳',
  stop: '■',
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onMove, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded shadow">
      <div className="flex gap-2">
        <button className="btn w-12 h-12 text-xl" onClick={() => onMove('forward')} disabled={disabled} title="Avancer">{arrowIcons.forward}</button>
      </div>
      <div className="flex gap-2">
        <button className="btn w-12 h-12 text-xl" onClick={() => onMove('turn_left')} disabled={disabled} title="Tourner à gauche">{arrowIcons.turn_left}</button>
        <button className="btn w-12 h-12 text-xl" onClick={() => onMove('left')} disabled={disabled} title="Aller à gauche">{arrowIcons.left}</button>
        <button className="btn w-12 h-12 text-xl" onClick={() => onMove('stop')} disabled={disabled} title="Stop">{arrowIcons.stop}</button>
        <button className="btn w-12 h-12 text-xl" onClick={() => onMove('right')} disabled={disabled} title="Aller à droite">{arrowIcons.right}</button>
        <button className="btn w-12 h-12 text-xl" onClick={() => onMove('turn_right')} disabled={disabled} title="Tourner à droite">{arrowIcons.turn_right}</button>
      </div>
      <div className="flex gap-2">
        <button className="btn w-12 h-12 text-xl" onClick={() => onMove('backward')} disabled={disabled} title="Reculer">{arrowIcons.backward}</button>
      </div>
    </div>
  )
}
