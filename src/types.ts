export type GraphType = 'speed' | 'acceleration' | 'position'

export enum OperationMode {
  MANUAL = 0,
  AUTONOMOUS = 1,
  DEBUGGING = 2,
}

export enum RobotStatus {
  RUNNING = 1,
  PAUSED = 2,
  STOPPED = 0,
}

export interface RobotStats {
  acceleration: { x: number; y: number; z: number }
  speed: number
  position: { x: number; y: number; z: number }
}

export interface SensorParameter<T extends string | number | boolean = string> {
  type: "string" | "int" | "boolean"
  description?: string
  value: T
  // min et max uniquement si T est number
  range?: T extends number ? [number, number] : never
  // options uniquement si T est string
  options?: T extends string ? T[] : never

  requires_reboot?: boolean
}



/*export interface SensorNumberParameter {
  value: number
  min: number
  max: number
  step: number
  unit: string
  requires_reboot?: boolean
}*/

export interface Sensor {
  id: string
  name: string
  type: string
  package_name: string
  node_name: string
  enabled: boolean
  params: {
    [key: string]: SensorParameter<number | string | boolean>
  }
}

export interface Waypoint {
  id: string
  type: 'start' | 'checkpoint' | 'end'
  position: [number, number]
  name: string
}