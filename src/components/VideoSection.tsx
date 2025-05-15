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
                setImageSrc(message.encoding === 'rgb8' ? convertRGB8ToDataURL(message.data, 640, 480) : message.enconding == '16UC1' ?convert16UC1ToDataURL(message.data, 640, 480) : null)

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

/**
 * Convertit une image 16UC1 (16 bits, unsigned, 1 canal) en Data URL
 * @param rawData Les données brutes de l'image en base64
 * @param width Largeur de l'image
 * @param height Hauteur de l'image
 * @param step Nombre d'octets par ligne (défaut: largeur * 2)
 * @returns Data URL de l'image
 */
function convert16UC1ToDataURL(rawData: string, width: number, height: number, step: number = width * 2): string {
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
    
    // Nombre d'octets utilisés par pixel
    const bytesPerPixel = 2;
    // Nombre de pixels à traiter par ligne
    const pixelsPerLine = width;
    
    // Parcours l'image ligne par ligne
    for (let y = 0; y < height; y++) {
        const rowOffset = y * step;
        
        for (let x = 0; x < pixelsPerLine; x++) {
            const pixelOffset = rowOffset + x * bytesPerPixel;
            const bufferOffset = (y * width + x) * 4;
            
            // Combine les deux octets pour obtenir une valeur 16 bits
            const value = (binary.charCodeAt(pixelOffset) << 8) | binary.charCodeAt(pixelOffset + 1);
            
            // Normalisation de la valeur 16 bits (0-65535) vers 8 bits (0-255)
            const normalizedValue = value >> 8; // Équivalent à Math.round(value / 256)
            
            // Applique la même valeur aux composantes R, G, B (niveau de gris)
            buffer[bufferOffset] = normalizedValue;     // R
            buffer[bufferOffset + 1] = normalizedValue; // G
            buffer[bufferOffset + 2] = normalizedValue; // B
            buffer[bufferOffset + 3] = 255;             // A (opaque)
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/jpeg');
}