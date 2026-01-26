// Govee H6046 Light Bars
// Supported commands: turn, brightness, color, colorTem

import { controlDevice, getDeviceState } from '../client';
import { type GoveeStateProperties, parseStateProperties } from '../state';

export const MODEL = 'H6046';

export interface H6046Config {
  device: string; // MAC address
}

export class H6046Device {
  readonly model = MODEL;

  constructor(private readonly config: H6046Config) {}

  get device(): string {
    return this.config.device;
  }

  /**
   * Get the current device state
   */
  async getState(): Promise<GoveeStateProperties> {
    const rawState = await getDeviceState(this.device, this.model);
    return parseStateProperties(rawState.properties);
  }

  /**
   * Turn the device on or off
   */
  async turn(value: 'on' | 'off'): Promise<void> {
    await controlDevice(this.device, this.model, { name: 'turn', value });
  }

  /**
   * Turn the device on
   */
  async turnOn(): Promise<void> {
    await this.turn('on');
  }

  /**
   * Turn the device off
   */
  async turnOff(): Promise<void> {
    await this.turn('off');
  }

  /**
   * Set brightness (0-100)
   */
  async setBrightness(value: number): Promise<void> {
    if (value < 0 || value > 100) {
      throw new Error('Brightness must be between 0 and 100');
    }
    await controlDevice(this.device, this.model, { name: 'brightness', value });
  }

  /**
   * Set color using RGB values (0-255 each)
   */
  async setColor(r: number, g: number, b: number): Promise<void> {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error('RGB values must be between 0 and 255');
    }
    await controlDevice(this.device, this.model, {
      name: 'color',
      value: { r, g, b },
    });
  }

  /**
   * Set color temperature in Kelvin
   */
  async setColorTemp(kelvin: number): Promise<void> {
    await controlDevice(this.device, this.model, {
      name: 'colorTem',
      value: kelvin,
    });
  }
}

/**
 * Create a new H6046 device instance
 */
export function createH6046(device: string): H6046Device {
  return new H6046Device({ device });
}
