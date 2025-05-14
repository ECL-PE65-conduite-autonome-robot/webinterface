import React, { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import ROSLIB, { Message } from 'roslib'

interface VideoSectionProps {
  showVideo: boolean
  setShowVideo: (show: boolean) => void
}

export function VideoSection({ showVideo, setShowVideo }: VideoSectionProps) {

  const [imageSrc, setImageSrc] = useState<string | null>(null)

    useEffect(() => {
        // Création de l'instance ROS
        const ros = new ROSLIB.Ros({
            url: 'ws://localhost:9090'
        })

        ros.on('connection', () => {
            console.log('Connected to ROS server in VideoSection')
        })

        ros.on('error', (error) => {
            console.error('ROS error in VideoSection:', error)
        })

        // Abonnez-vous au topic de l'image
        const imageTopic = new ROSLIB.Topic({
            ros: ros,
            name: '/camera/color/image_raw',
            messageType: 'sensor_msgs/msg/Image'
        })

        /*imageTopic.subscribe((message: Message) => {
            console.log('Received image in VideoSection:', message)
            imageTopic.unsubscribe()
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if(message.data) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                setImageSrc(`data:image/jpeg;base64,${message.data}`)
            }
        })*/

        return () => {
            imageTopic.unsubscribe()
            ros.close()
        }
    }, [])

    if (!showVideo) {
        return null
    }

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
        //<div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        //  <p className="text-gray-400">Flux vidéo non disponible</p>
        //</div>
        <div className="video-section">
            {imageSrc ? (
                <img src={imageSrc} alt="ROS Camera" className="max-w-full h-auto rounded shadow" />
            ) : (
                <p>Loading video stream...</p>
            )}
        </div>
      )}
    </section>
  )
}