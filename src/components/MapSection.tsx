import React from 'react'
import { Navigation } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Waypoint } from '../types'

interface MapEventsProps {
  onMapClick: (e: L.LeafletMouseEvent) => void
}

function MapEvents({ onMapClick }: MapEventsProps) {
  useMapEvents({
    click: onMapClick,
  })
  return null
}

interface MapSectionProps {
  waypoints: Waypoint[]
  selectedWaypointType: 'start' | 'checkpoint' | 'end'
  setSelectedWaypointType: (type: 'start' | 'checkpoint' | 'end') => void
  onMapClick: (e: L.LeafletMouseEvent) => void
  removeWaypoint: (id: string) => void
}

export function MapSection({
  waypoints,
  selectedWaypointType,
  setSelectedWaypointType,
  onMapClick,
  removeWaypoint
}: MapSectionProps) {
  const defaultCenter: [number, number] = [48.8566, 2.3522]

  const getWaypointIcon = (type: 'start' | 'checkpoint' | 'end') => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="marker-pin ${type}"></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    })
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6 col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Navigation GPS</h2>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedWaypointType}
            onChange={(e) => setSelectedWaypointType(e.target.value as 'start' | 'checkpoint' | 'end')}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2"
          >
            <option value="start">Point de départ</option>
            <option value="checkpoint">Point intermédiaire</option>
            <option value="end">Point d'arrivée</option>
          </select>
        </div>
      </div>
      
      <div style={{ height: '500px', width: '100%' }} className="rounded-lg overflow-hidden relative">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onMapClick={onMapClick} />
          {waypoints.map((waypoint) => (
            <Marker
              key={waypoint.id}
              position={waypoint.position}
              icon={getWaypointIcon(waypoint.type)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{waypoint.name}</h3>
                  <p className="text-sm text-gray-600">
                    {waypoint.position[0].toFixed(6)}, {waypoint.position[1].toFixed(6)}
                  </p>
                  <button
                    onClick={() => removeWaypoint(waypoint.id)}
                    className="mt-2 px-2 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
                  >
                    Supprimer
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          {waypoints.length > 1 && (
            <Polyline
              positions={waypoints.map(wp => wp.position)}
              color="#3b82f6"
              weight={3}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>
    </section>
  )
}