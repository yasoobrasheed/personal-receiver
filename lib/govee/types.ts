// Govee API response types and device/mode configuration types

import type { GoveeRawProperty } from './state';

export type { GoveeRawProperty, GoveeStateProperties } from './state';

// API Response Types
export interface GoveeDevice {
  readonly device: string; // Device MAC address
  readonly model: string;
  readonly deviceName: string;
  readonly controllable: boolean;
  readonly retrievable: boolean;
  readonly supportCmds: readonly string[];
}

export interface GoveeDevicesResponse {
  readonly code: number;
  readonly message: string;
  readonly data: {
    readonly devices: readonly GoveeDevice[];
  };
}

export interface GoveeDeviceState {
  readonly device: string;
  readonly model: string;
  readonly properties: readonly GoveeRawProperty[];
}

export interface GoveeStateResponse {
  readonly code: number;
  readonly message: string;
  readonly data: GoveeDeviceState;
}

export interface GoveeControlResponse {
  readonly code: number;
  readonly message: string;
}

export interface GoveeAPIError {
  readonly code: number;
  readonly message: string;
}

// Control Command Types
export type GoveeCommand =
  | { name: 'turn'; value: 'on' | 'off' }
  | { name: 'brightness'; value: number } // 0-100
  | { name: 'color'; value: { r: number; g: number; b: number } }
  | { name: 'colorTem'; value: number }; // Color temperature in Kelvin

// Device Configuration Types
export interface DeviceConfig {
  readonly id: string; // Friendly identifier
  readonly device: string; // MAC address
  readonly model: string;
  readonly name: string;
}

// Mode Configuration Types
export interface DeviceState {
  readonly deviceId: string; // References DeviceConfig.id
  readonly power: 'on' | 'off';
  readonly brightness?: number; // 0-100
  readonly color?: { r: number; g: number; b: number };
  readonly colorTemp?: number; // Kelvin
}

export interface ModeConfig {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly devices: readonly DeviceState[];
}

export interface GoveeConfig {
  readonly devices: readonly DeviceConfig[];
  readonly modes: readonly ModeConfig[];
}
