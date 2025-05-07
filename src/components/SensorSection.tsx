import React from 'react'
import { Cpu, Save, RefreshCw } from 'lucide-react'
import { Sensor } from '../types'

interface SensorSectionProps {
  selectedSensor: Sensor | null
  sensorsList: Sensor[]
  sensorParams: { [key: string]: number | string | boolean }
  handleSensorChange: (sensorId: string) => void
  handleParamChange: (paramName: string, value: number | string | boolean) => void
  handleSaveParams: () => void
  handleSaveAndReboot: () => void
  isSaving: boolean
  isRebooting: boolean
}

export function SensorSection({
  selectedSensor,
  sensorsList,
  sensorParams,
  handleSensorChange,
  handleParamChange,
  handleSaveParams,
  handleSaveAndReboot,
  isSaving,
  isRebooting
}: SensorSectionProps) {
  const runtimeParams = selectedSensor ? Object.entries(selectedSensor.params)
    .filter(([_, param]) => !param.requires_reboot) : []
  const bootParams = selectedSensor ? Object.entries(selectedSensor.params)
    .filter(([_, param]) => param.requires_reboot) : []

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Cpu className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Configuration des capteurs</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sélectionner un capteur:</label>
          <select
            value={selectedSensor?.id}
            onChange={(e) => handleSensorChange(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2"
          >
            {sensorsList.map(sensor => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Paramètres d'exécution */}
        {runtimeParams.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Paramètres d'exécution</h3>
            <div className="grid gap-4">
              {runtimeParams.map(([paramName, param]) => (
                <div key={paramName} className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {paramName.charAt(0).toUpperCase() + paramName.slice(1)}
                  </label>
                  <div className="flex items-center space-x-4">
                    {typeof sensorParams[paramName] === "number" ? (
                      <>
                        <input
                          type="range"
                          min={param.range ? param.range[0] : 0}
                          max={param.range ? param.range[1] : 100}
                          value={sensorParams[paramName] as number}
                          onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min={param.range ? param.range[0] : 0}
                          max={param.range ? param.range[1] : 100}
                          value={sensorParams[paramName] as number}
                          onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </>
                    ) : typeof sensorParams[paramName] === "string" ? (
                      <input
                        type="text"
                        value={sensorParams[paramName] as string}
                        onChange={(e) => handleParamChange(paramName, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : typeof sensorParams[paramName] === "boolean" ? (
                      <input
                        type="checkbox"
                        checked={sensorParams[paramName] as boolean}
                        onChange={(e) => handleParamChange(paramName, e.target.checked)}
                        className="h-5 w-5"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveParams}
              disabled={isSaving}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}</span>
            </button>
          </div>
        )}

        {/* Paramètres de démarrage */}
        {bootParams.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-medium text-gray-800">Paramètres de démarrage</h3>
            <div className="grid gap-4">
              {bootParams.map(([paramName, param]) => (
                <div key={paramName} className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {paramName.charAt(0).toUpperCase() + paramName.slice(1)}
                  </label>
                  <div className="flex items-center space-x-4">
                    {typeof sensorParams[paramName] === "number" ? (
                      <>
                        <input
                          type="range"
                          min={param.range ? param.range[0] : 0}
                          max={param.range ? param.range[1] : 100}
                          value={sensorParams[paramName] as number}
                          onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min={param.range ? param.range[0] : 0}
                          max={param.range ? param.range[1] : 100}
                          value={sensorParams[paramName] as number}
                          onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </>
                    ) : typeof sensorParams[paramName] === "string" ? (
                      <input
                        type="text"
                        value={sensorParams[paramName] as string}
                        onChange={(e) => handleParamChange(paramName, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : typeof sensorParams[paramName] === "boolean" ? (
                      <input
                        type="checkbox"
                        checked={sensorParams[paramName] as boolean}
                        onChange={(e) => handleParamChange(paramName, e.target.checked)}
                        className="h-5 w-5"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveAndReboot}
              disabled={isRebooting}
              className="w-full mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${isRebooting ? 'animate-spin' : ''}`} />
              <span>{isRebooting ? 'Redémarrage...' : 'Sauvegarder et redémarrer'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}