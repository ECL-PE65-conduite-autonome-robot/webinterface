import React, { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { StatusIndicator } from './components/StatusIndicator'
import { MapSection } from './components/MapSection'
import { StatsSection } from './components/StatsSection'
import { VideoSection } from './components/VideoSection'
import { GraphSection } from './components/GraphSection'
import { SensorSection } from './components/SensorSection'
import { ControlPanel } from './components/ControlPanel'
import { OperationMode, RobotStatus, GraphType, RobotStats, Sensor, Waypoint } from './types'
import type { LeafletMouseEvent } from 'leaflet'
import ROSLIB from "roslib";

// Simple composant d'alerte
function Alert({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  if (!message) return null
  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      <div className="flex items-center gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 font-bold">&times;</button>
      </div>
    </div>
  )
}

// Exemple de capteurs
const sensorsListold: Sensor[] = [
  {
    id: 'accel1',
    name: 'Accéléromètre Principal',
    type: 'accelerometer',
    package_name: 'core_package',
    node_name: 'accel_node',
    enabled: true,
    params: {
      sensitivity: {
        type: 'int',
        value: 2,
        range: [1, 16],
        requires_reboot: true
      },
      sampleRate: {
        type: 'int',
        value: 100,
        range: [10, 1000],
        requires_reboot: true
      },
      filterCutoff: {
        type: 'int',
        value: 50,
        range: [1, 100],
      }
    }
  },
  {
    id: 'gyro1',
    name: 'Gyroscope',
    type: 'gyroscope',
    package_name: 'core_package',
    node_name: 'gyro_node',
    enabled: true,
    params: {
      range: {
        type: 'int',
        value: 250,
        range: [125, 2000],
        requires_reboot: true
      },
      bandwidth: {
        value: 50,
        type: 'int',
        range: [1, 100],
      }
    }
  }
]

function App() {
  const [mode, setMode] = useState<OperationMode>(OperationMode.MANUAL)
  const [status, setStatus] = useState<RobotStatus>(RobotStatus.STOPPED)
  const [showVideo, setShowVideo] = useState(true)
  const [selectedGraph, setSelectedGraph] = useState<GraphType>('speed')
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [selectedWaypointType, setSelectedWaypointType] = useState<'start' | 'checkpoint' | 'end'>('start')
  const [isSaving, setIsSaving] = useState(false)
  const [isRebooting, setIsRebooting] = useState(false)
  /*const [selectedSensor, setSelectedSensor] = useState<Sensor>(sensorsList[0])
  const [sensorParams, setSensorParams] = useState<{[key: string]: number | string | boolean}>(
    Object.fromEntries(
      Object.entries(sensorsList[0].params).map(([key, param]) => [key, param.value])
    )
  )*/
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const [sensorParams, setSensorParams] = useState<{[key: string]: number | string | boolean}>(
    {}
  )
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' }>({ message: '', type: 'success' })
  
  // Simulation des données en temps réel
  const [stats] = useState<RobotStats>({
    acceleration: { x: 0.5, y: 0.3, z: 0.1 },
    speed: 1.2,
    position: { x: 10, y: 20, z: 30 }
  })

  const [sensorsList, setSensorsList] = useState<Sensor[]>([])


  // Crée une seule instance ROS
  const rosRef = useRef<ROSLIB.Ros | null>(null)
  if (!rosRef.current) {
    rosRef.current = new ROSLIB.Ros({
      url: 'ws://localhost:9090'
    })
  }
  const ros = rosRef.current

  useEffect(() => {
    ros.on('connection', () => {
      console.log('Connected to ROS server')

      const getConfigService = new ROSLIB.Service({
        ros: ros,
        name: '/get_config',
        serviceType: 'core_interfaces/srv/GetConfig.srv'
      });

      getConfigService.callService({}, (result) => {
        console.log('Service result:', JSON.parse(result.config));
        const parsedResult = JSON.parse(result.config)
        // TODO: Add a version check here to make sure the result is the expected one
        // We expected a output like this:
        // {
        //   "sensor1": {
        //     "type": "accelerometer",
        //     "parameters": { ... }
        //   },
        //   "sensor2": {
        //     "type": "gyroscope",
        //     "parameters": { ... }
        //   }
        // }
        const tempSensorsList: Sensor[] = []
        for (const [key, value] of Object.entries(parsedResult) as [string, Sensor][]) {
          tempSensorsList.push({
            id: key,
            name: key,
            type: value.type,
            enabled: value.enabled,
            package_name: value.package_name,
            node_name: value.node_name,
            params: value.params,
          })
        }

        setSensorsList(tempSensorsList)
    
        setSelectedSensor(tempSensorsList[0])
        setSensorParams(
          Object.fromEntries(
            Object.entries(tempSensorsList[0].params).map(([key, param]) => [key, param.value])
          )
        )
        setAlert({ message: 'Configuration récupérée avec succès', type: 'success' })
      });
    })
    ros.on('error', (error) => {
      console.error('Error connecting to ROS:', error)
      setAlert({ message: 'Erreur de connexion à ROS', type: 'error' })
    })
    ros.on('close', () => {
      console.log('Disconnected from ROS server')
      setAlert({ message: 'Déconnecté du serveur ROS', type: 'error' })
    })

  }, [ros, sensorsList])

  useEffect(() => {
    if (!alert.message) return;
    const timeout = setTimeout(() => {
      setAlert(prev => ({ ...prev, message: '' }))
    }, alert.type === 'success' ? 3000 : 5000)
    return () => clearTimeout(timeout)
  }, [alert])

  // Change mode
  const setModeService = new ROSLIB.Service({
    ros: ros,
    name: '/set_mode',
    serviceType: 'core_interfaces/srv/SetMode.srv'
  });

  const callChangeMode = (newMode: OperationMode) => {
    const request = new ROSLIB.ServiceRequest({
      mode: newMode
    })
    setModeService.callService(request, (result) => {
      console.log('Mode changé:', result)
      setMode(newMode)
      setAlert({ message: 'Mode changé avec succès', type: 'success' })
    }, (error) => {
      console.error('Erreur lors du changement de mode:', error)
      setAlert({ message: 'Erreur lors du changement de mode', type: 'error' })
    })
  }
  
  // Change status
  const setStatusService = new ROSLIB.Service({
    ros: ros,
    name: '/set_status',
    serviceType: 'core_interfaces/srv/SetStatus.srv'
  });

  const callChangeStatus = (newStatus: RobotStatus) => {
    const request = new ROSLIB.ServiceRequest({
      status: newStatus
    });
    setStatusService.callService(request, (result) => {
      console.log('Statut changé:', result)
      setStatus(newStatus)
      setAlert({ message: 'Statut changé avec succès', type: 'success' })
    }, (error) => {
      console.error('Erreur lors du changement de statut:', error)
      setAlert({ message: 'Erreur lors du changement de statut', type: 'error' })
    });
  };

  const handleStart = () => callChangeStatus(RobotStatus.RUNNING)
  const handlePause = () => callChangeStatus(RobotStatus.PAUSED)
  const handleStop = () => callChangeStatus(RobotStatus.STOPPED)

  const handleSensorChange = (sensorId: string) => {
    const sensor = sensorsList.find(s => s.id === sensorId)
    if (sensor) {
      setSelectedSensor(sensor)
      setSensorParams(
        Object.fromEntries(
          Object.entries(sensor.params).map(([key, param]) => [key, param.value])
        )
      )
    }
  }

  const handleParamChange = (paramName: string, value: number | boolean | string) => {
    setSensorParams(prev => ({
      ...prev,
      [paramName]: value
    }))
  }
  
  const updateParametersService = new ROSLIB.Service({
    ros: ros,
    name: '/update_params',
    serviceType: 'core_interfaces/srv/UpdateParams.srv'
  });

  const handleSaveParams = async () => {
    setIsSaving(true)
    try {

      if (!selectedSensor) {
        console.error('Aucun capteur sélectionné')
        setAlert({ message: 'Aucun capteur sélectionné', type: 'error' })
        return
      }

      const request = new ROSLIB.ServiceRequest({
        sensor_name: selectedSensor.name,
        param_names: Object.keys(selectedSensor.params).filter((param) => !selectedSensor.params[param as keyof typeof selectedSensor.params].requires_reboot),
        new_values: Object.entries(sensorParams).filter(item => !selectedSensor.params[item[0] as keyof typeof selectedSensor.params].requires_reboot).map(item => item[1].toString())
      })

      updateParametersService.callService(request, (result) => {
        console.log('Paramètres mis à jour:', result)
        setIsSaving(false)
        setAlert({ message: 'Paramètres mis à jour avec succès', type: 'success' })
      }, (error) => {
        console.error('Erreur lors de la mise à jour des paramètres:', error)
        setIsSaving(false)
        setAlert({ message: 'Erreur lors de la mise à jour des paramètres', type: 'error' })
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setIsSaving(false)
      setAlert({ message: 'Erreur lors de la sauvegarde', type: 'error' })
    }
  }

  const rebootService = new ROSLIB.Service({
    ros: ros,
    name: '/reboot',
    serviceType: 'core_interfaces/srv/Reboot.srv'
  });

  const handleSaveAndReboot = async () => {
    setIsRebooting(true)
    try {
      if (!selectedSensor) {
        console.error('Aucun capteur sélectionné')
        setAlert({ message: 'Aucun capteur sélectionné', type: 'error' })
        return
      }

      const request = new ROSLIB.ServiceRequest({
        sensor_name: selectedSensor.name,
        param_names: Object.keys(selectedSensor.params).filter((param) => selectedSensor.params[param as keyof typeof selectedSensor.params].requires_reboot),
        new_values: Object.entries(sensorParams).filter(item => selectedSensor.params[item[0] as keyof typeof selectedSensor.params].requires_reboot).map(item => item[1].toString())
      })

      updateParametersService.callService(request, (result) => {
        console.log('Paramètres mis à jour:', result)

        rebootService.callService({}, (result) => {
          console.log('Redémarrage:', result)
          setIsRebooting(false)
          setAlert({ message: 'Paramètres sauvegardés et redémarrage effectué', type: 'success' })
        }, (error) => {
          console.error('Erreur lors du redémarrage:', error)
          setIsRebooting(false)
          setAlert({ message: 'Erreur lors du redémarrage', type: 'error' })
        });
      }, (error) => {
        console.error('Erreur lors de la mise à jour des paramètres:', error)
        setIsRebooting(false)
        setAlert({ message: 'Erreur lors de la mise à jour des paramètres', type: 'error' })
      })

      console.log('Paramètres sauvegardés et redémarrage...')
    } catch (error) {
      console.error('Erreur lors du redémarrage:', error)
      setIsRebooting(false)
      setAlert({ message: 'Erreur lors du redémarrage', type: 'error' })
    }
  }

  const image_color_raw_topic = new ROSLIB.Topic({
    ros: ros,
    name: '/camera/color/image_raw',
    messageType: 'sensor_msgs/msg/Image',
    compression: 'png'
  });

  image_color_raw_topic.subscribe((message) => {
    console.log('Received image data:', message.data)
    image_color_raw_topic.unsubscribe()
  });

  const handleMapClick = (e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      type: selectedWaypointType,
      position: [lat, lng],
      name: `${selectedWaypointType.charAt(0).toUpperCase() + selectedWaypointType.slice(1)} ${waypoints.length + 1}`
    }

    if (selectedWaypointType === 'start' || selectedWaypointType === 'end') {
      setWaypoints(prev => [
        ...prev.filter(wp => wp.type !== selectedWaypointType),
        newWaypoint
      ])
    } else {
      setWaypoints(prev => [...prev, newWaypoint])
    }

    if (selectedWaypointType === 'start') {
      setSelectedWaypointType('checkpoint')
    } else if (selectedWaypointType === 'checkpoint' && !waypoints.find(wp => wp.type === 'end')) {
      setSelectedWaypointType('end')
    }
  }

  const removeWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id))
  }

  // Publisher pour piloter le robot via cmd_vel
  const cmdVelTopic = useRef<ROSLIB.Topic | null>(null)
  if (!cmdVelTopic.current) {
    cmdVelTopic.current = new ROSLIB.Topic({
      ros: ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    })
  }

  const handleMove = (direction: 'forward' | 'backward' | 'left' | 'right' | 'stop' | 'turn_left' | 'turn_right') => {
    const linear = { x: 0, y: 0, z: 0 }
    const angular = { x: 0, y: 0, z: 0 }
    const speed = 0.5 // m/s
    const turn = 1.0  // rad/s
    switch (direction) {
      case 'forward':
        linear.x = speed
        break
      case 'backward':
        linear.x = -speed
        break
      case 'left':
        linear.y = speed
        break
      case 'right':
        linear.y = -speed
        break
      case 'turn_left':
        angular.z = turn
        break
      case 'turn_right':
        angular.z = -turn
        break
      case 'stop':
        // tout à zéro
        break
    }
    cmdVelTopic.current?.publish({ linear, angular })
    setAlert({ message: `Commande envoyée: ${direction}`, type: 'success' })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: '' })} />
      <Header
        mode={mode}
        setMode={callChangeMode}
        status={status}
        onStart={handleStart}
        onPause={handlePause}
        onStop={handleStop}
      />

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ControlPanel onMove={handleMove} disabled={status !== RobotStatus.RUNNING} />
        <MapSection
          waypoints={waypoints}
          selectedWaypointType={selectedWaypointType}
          setSelectedWaypointType={setSelectedWaypointType}
          onMapClick={handleMapClick}
          removeWaypoint={removeWaypoint}
        />

        <VideoSection
          showVideo={showVideo}
          setShowVideo={setShowVideo}
          topicName="/camera/color/image_raw"
        />

        <VideoSection
          showVideo={showVideo}
          setShowVideo={setShowVideo}
          topicName="/camera/depth/image_raw"
        />

        <StatsSection stats={stats} />

        <GraphSection
          selectedGraph={selectedGraph}
          setSelectedGraph={setSelectedGraph}
        />

        <SensorSection
          selectedSensor={selectedSensor}
          sensorsList={sensorsList}
          sensorParams={sensorParams}
          handleSensorChange={handleSensorChange}
          handleParamChange={handleParamChange}
          handleSaveParams={handleSaveParams}
          handleSaveAndReboot={handleSaveAndReboot}
          isSaving={isSaving}
          isRebooting={isRebooting}
        />
      </main>

      <StatusIndicator status={status} />
    </div>
  )
}

export default App