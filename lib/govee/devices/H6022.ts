// Govee H6022 Weather Station Light (Mushroom Lamp)
// Uses LAN API for control with simple scene support

import {
  turnDevice,
  setBrightness,
  setColor,
  setColorTemp,
  setScene,
  getDeviceStatus,
  type LanDeviceState,
} from '../lan';

export const MODEL = 'H6022';

// Simple scenes available on H6022 (code-based only)
export const H6022_SCENES = {
  rainbow: 42,
  forest: 44,
  ocean: 43,
  wave: 46,
  snowflake: 41,
  fire: 40,
  'white-light': 99,
  reading: 35,
  'night-light': 38,
  joyful: 45,
  'starry-sky': 47,
} as const;

export type H6022SceneName = keyof typeof H6022_SCENES;

export interface H6022Config {
  ip: string; // LAN IP address
  device?: string; // MAC address (optional, for reference)
}

export class H6022Device {
  readonly model = MODEL;

  constructor(private readonly config: H6022Config) {}

  get ip(): string {
    return this.config.ip;
  }

  /**
   * Get the current device state
   */
  async getState(): Promise<LanDeviceState | null> {
    return getDeviceStatus(this.ip);
  }

  /**
   * Turn the device on or off
   */
  async turn(on: boolean): Promise<void> {
    await turnDevice(this.ip, on);
  }

  /**
   * Turn the device on
   */
  async turnOn(): Promise<void> {
    await this.turn(true);
  }

  /**
   * Turn the device off
   */
  async turnOff(): Promise<void> {
    await this.turn(false);
  }

  /**
   * Set brightness (1-100)
   */
  async setBrightness(value: number): Promise<void> {
    await setBrightness(this.ip, value);
  }

  /**
   * Set color using RGB values (0-255 each)
   */
  async setColor(r: number, g: number, b: number): Promise<void> {
    await setColor(this.ip, r, g, b);
  }

  /**
   * Set color temperature in Kelvin (2000-9000)
   */
  async setColorTemp(kelvin: number): Promise<void> {
    await setColorTemp(this.ip, kelvin);
  }

  /**
   * Set a scene by name
   */
  async setScene(sceneName: H6022SceneName): Promise<void> {
    const code = H6022_SCENES[sceneName];
    await setScene(this.ip, code);
  }

  /**
   * Set a scene by code (for custom/unlisted scenes)
   */
  async setSceneByCode(code: number): Promise<void> {
    await setScene(this.ip, code);
  }
}

/**
 * Create a new H6022 device instance
 */
export function createH6022(ip: string, device?: string): H6022Device {
  return new H6022Device({ ip, device });
}
