import type {
  DeviceState,
  GoveeCommand,
  GoveeControlResponse,
  GoveeDevice,
  GoveeDevicesResponse,
  GoveeStateResponse,
} from './types';

const GOVEE_API_BASE_URL = 'https://developer-api.govee.com/v1';

export class GoveeAPIError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'GoveeAPIError';
  }
}

function getApiKey(): string {
  const apiKey = process.env.GOVEE_API_KEY;
  if (!apiKey) {
    throw new GoveeAPIError('GOVEE_API_KEY environment variable is not set', 0);
  }
  return apiKey;
}

export async function listDevices(): Promise<readonly GoveeDevice[]> {
  const response = await fetch(`${GOVEE_API_BASE_URL}/devices`, {
    method: 'GET',
    headers: {
      'Govee-API-Key': getApiKey(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new GoveeAPIError(`HTTP ${response.status}`, 0, response.status);
  }

  const data = (await response.json()) as GoveeDevicesResponse;
  if (data.code !== 200) {
    throw new GoveeAPIError(data.message, data.code);
  }

  return data.data.devices;
}

export async function getDeviceState(
  device: string,
  model: string,
): Promise<GoveeStateResponse['data']> {
  const url = new URL(`${GOVEE_API_BASE_URL}/devices/state`);
  url.searchParams.set('device', device);
  url.searchParams.set('model', model);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Govee-API-Key': getApiKey(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new GoveeAPIError(`HTTP ${response.status}`, 0, response.status);
  }

  const data = (await response.json()) as GoveeStateResponse;
  if (data.code !== 200) {
    throw new GoveeAPIError(data.message, data.code);
  }

  return data.data;
}

export async function controlDevice(
  device: string,
  model: string,
  command: GoveeCommand,
): Promise<void> {
  const response = await fetch(`${GOVEE_API_BASE_URL}/devices/control`, {
    method: 'PUT',
    headers: {
      'Govee-API-Key': getApiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device,
      model,
      cmd: command,
    }),
  });

  if (!response.ok) {
    throw new GoveeAPIError(`HTTP ${response.status}`, 0, response.status);
  }

  const data = (await response.json()) as GoveeControlResponse;
  if (data.code !== 200) {
    throw new GoveeAPIError(data.message, data.code);
  }
}

export async function applyDeviceState(
  device: string,
  model: string,
  state: DeviceState,
): Promise<void> {
  // Apply power state first
  await controlDevice(device, model, { name: 'turn', value: state.power });

  // If turning off, no need to set other properties
  if (state.power === 'off') {
    return;
  }

  // Apply brightness if specified
  if (state.brightness !== undefined) {
    await controlDevice(device, model, {
      name: 'brightness',
      value: state.brightness,
    });
  }

  // Apply color if specified (takes precedence over color temp)
  if (state.color) {
    await controlDevice(device, model, { name: 'color', value: state.color });
  } else if (state.colorTemp !== undefined) {
    await controlDevice(device, model, {
      name: 'colorTem',
      value: state.colorTemp,
    });
  }
}
