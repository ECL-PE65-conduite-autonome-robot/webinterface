import React, { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import ROSLIB, { Message } from 'roslib'

interface VideoSectionProps {
  showVideo: boolean
  topicName: string
  setShowVideo: (show: boolean) => void
}

export function VideoSection({ showVideo, setShowVideo, topicName }: VideoSectionProps) {

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
            name: topicName,
            messageType: 'sensor_msgs/msg/Image',
            throttle_rate: 100 // 1 image par 1/10 seconde
        })

        /*const timestart = Date.now()

        //setImageSrc(convertRGB8ToDataURL(imageb64, 640, 480))
        const timeend = Date.now()
        console.log('Time taken to convert image:', timeend - timestart, 'ms')*/

        imageTopic.subscribe((message: Message) => {
            //console.log('Received image in VideoSection:', message)
            //imageTopic.unsubscribe()
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if(message.data) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                setImageSrc(convertRGB8ToDataURL(message.data, 640, 480))

                //setImageSrc(`data:image/png;base64,${message.data}`)
            }
        })

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

function convertRGB8ToDataURL(rawData: string, width: number, height: number): string {
    // Décode la chaîne base64 en valeurs binaires
    const binary = atob(rawData);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Prépare un tableau pour les données RGBA
    const imageData = ctx.createImageData(width, height);
    const buffer = imageData.data;
    let dataIndex = 0;
    // Chaque pixel est constitué de 3 octets RGB; on ajoute l'opacité (255) pour chaque pixel
    for (let i = 0; i < binary.length; i += 3) {
        buffer[dataIndex++] = binary.charCodeAt(i);     // R
        buffer[dataIndex++] = binary.charCodeAt(i + 1); // G
        buffer[dataIndex++] = binary.charCodeAt(i + 2); // B
        buffer[dataIndex++] = 255;                      // A
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/jpeg');
}

function convertRGB82(rawData: string, width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return "";

    // Étape 1 : Décodage base64 → Uint8Array
    const binaryStr = atob(rawData);
    const rgb = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      rgb[i] = binaryStr.charCodeAt(i);
    }

    // Étape 2 : Conversion RGB → RGBA
    const rgba = new Uint8ClampedArray((rgb.length / 3) * 4);
    for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
      rgba[j] = rgb[i];         // R
      rgba[j + 1] = rgb[i + 1]; // G
      rgba[j + 2] = rgb[i + 2]; // B
      rgba[j + 3] = 255;        // A (opaque)
    }

    // Étape 3 : Création de l'image
    const imageData = new ImageData(rgba, width, height);
    ctx.putImageData(imageData, 0, 0);
    const dataURL = canvas.toDataURL('image/jpeg');
    return dataURL;
}