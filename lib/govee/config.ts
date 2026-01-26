import { applyDeviceState } from './client';
import type { DeviceConfig, GoveeConfig, ModeConfig } from './types';


// Configure your Govee devices here
// Get device MAC addresses and models by calling listDevices() or from the Govee app
export const goveeConfig: GoveeConfig = {
  devices: [
    {
      id: '1',
      device: '97:C3:D5:0E:C6:06:4E:81',
      model: 'H6046',
      name: 'Light Bars',
    },
  ],
  modes: [
    // TODO: Add modes here
    /**
     * All Off
     * All On
     * All Day
     * All Evening
     * All Night
     * 
     * Weather: (if off stay off, automatically turn on at wake time, off at sleep time)
     *  Rainy (Drizzle/Light, Moderate, Heavy) - Shades of Blue
     *  Sunny / Clear - Yellow or Orange if after sunset
     *  Partly Cloudy / Cloudy - Light Gray
     *  Overcast / Foggy / Misty - Dark Gray
     *  Thunderstorm - Purple
     * 
     * Calendar:
     *  Meeting Starts Now - White (if off stay off)
     *  Meeting Ends - Back to what it was before
     */
  ],
};

export function getDevice(deviceId: string): DeviceConfig | undefined {
  return goveeConfig.devices.find((d) => d.id === deviceId);
}

export function getMode(modeId: string): ModeConfig | undefined {
  return goveeConfig.modes.find((m) => m.id === modeId);
}

export function listModes(): readonly ModeConfig[] {
  return goveeConfig.modes;
}

export async function activateMode(modeId: string): Promise<void> {
  const mode = getMode(modeId);
  if (!mode) {
    throw new Error(`Mode not found: ${modeId}`);
  }

  for (const deviceState of mode.devices) {
    const device = getDevice(deviceState.deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceState.deviceId}`);
    }

    await applyDeviceState(device.device, device.model, deviceState);
  }
}
