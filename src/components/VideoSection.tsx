import React from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface VideoSectionProps {
  showVideo: boolean
  setShowVideo: (show: boolean) => void
}

export function VideoSection({ showVideo, setShowVideo }: VideoSectionProps) {
  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Flux vidéo</h2>
        <button
          onClick={() => setShowVideo(!showVideo)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          {showVideo ? (
            <EyeOff className="w-5 h-5 text-gray-600" />
          ) : (
            <Eye className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
      
      {showVideo && (
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Flux vidéo non disponible</p>
        </div>
      )}
    </section>
  )
}