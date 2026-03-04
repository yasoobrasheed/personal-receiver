// Govee LAN API Client
// Uses UDP to communicate directly with devices on the local network

import dgram from 'node:dgram';

const MULTICAST_ADDR = '239.255.255.250';
const DISCOVERY_PORT = 4001;
const LISTEN_PORT = 4002;
const COMMAND_PORT = 4003;

export interface LanDevice {
  ip: string;
  device: string; // MAC address
  sku: string; // Model
  bleVersionHard: string;
  bleVersionSoft: string;
  wifiVersionHard: string;
  wifiVersionSoft: string;
}

export interface LanDeviceState {
  onOff: 0 | 1;
  brightness: number;
  color?: { r: number; g: number; b: number };
  colorTemInKelvin?: number;
}

interface ScanMessage {
  msg: {
    cmd: 'scan';
    data: {
      account_topic: string;
    };
  };
}

interface DeviceStatusMessage {
  msg: {
    cmd: 'devStatus';
    data: LanDeviceState;
  };
}

/**
 * Discover Govee devices on the local network
 */
export async function discoverDevices(timeoutMs = 3000): Promise<LanDevice[]> {
  return new Promise((resolve, reject) => {
    const devices: LanDevice[] = [];
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    socket.on('error', (err) => {
      socket.close();
      reject(err);
    });

    socket.on('message', (msg, rinfo) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.msg?.cmd === 'scan' && data.msg?.data?.ip) {
          devices.push({
            ip: data.msg.data.ip,
            device: data.msg.data.device,
            sku: data.msg.data.sku,
            bleVersionHard: data.msg.data.bleVersionHard,
            bleVersionSoft: data.msg.data.bleVersionSoft,
            wifiVersionHard: data.msg.data.wifiVersionHard,
            wifiVersionSoft: data.msg.data.wifiVersionSoft,
          });
        }
      } catch {
        // Ignore non-JSON messages
      }
    });

    socket.bind(LISTEN_PORT, () => {
      const scanMsg = JSON.stringify({
        msg: {
          cmd: 'scan',
          data: {
            account_topic: 'reserve',
          },
        },
      });

      socket.send(scanMsg, DISCOVERY_PORT, MULTICAST_ADDR, (err) => {
        if (err) {
          socket.close();
          reject(err);
        }
      });

      setTimeout(() => {
        socket.close();
        resolve(devices);
      }, timeoutMs);
    });
  });
}

/**
 * Send a command to a device and optionally wait for response
 */
async function sendCommand(
  deviceIp: string,
  command: object,
  waitForResponse = false,
  timeoutMs = 2000,
): Promise<DeviceStatusMessage | null> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    socket.on('error', (err) => {
      socket.close();
      reject(err);
    });

    let resolved = false;
    if (waitForResponse) {
      socket.on('message', (msg) => {
        if (resolved) return;
        try {
          const data = JSON.parse(msg.toString()) as DeviceStatusMessage;
          resolved = true;
          socket.close();
          resolve(data);
        } catch {
          // Ignore
        }
      });
    }

    socket.bind(LISTEN_PORT, () => {
      const msgStr = JSON.stringify(command);
      socket.send(msgStr, COMMAND_PORT, deviceIp, (err) => {
        if (err) {
          socket.close();
          reject(err);
        } else if (!waitForResponse) {
          socket.close();
          resolve(null);
        }
      });

      if (waitForResponse) {
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            socket.close();
            resolve(null);
          }
        }, timeoutMs);
      }
    });
  });
}

/**
 * Get device status
 */
export async function getDeviceStatus(deviceIp: string): Promise<LanDeviceState | null> {
  const command = {
    msg: {
      cmd: 'devStatus',
      data: {},
    },
  };
  const response = await sendCommand(deviceIp, command, true);
  return response?.msg?.data ?? null;
}

/**
 * Turn device on or off
 */
export async function turnDevice(deviceIp: string, on: boolean): Promise<void> {
  const command = {
    msg: {
      cmd: 'turn',
      data: {
        value: on ? 1 : 0,
      },
    },
  };
  await sendCommand(deviceIp, command);
}

/**
 * Set device brightness (1-100)
 */
export async function setBrightness(deviceIp: string, brightness: number): Promise<void> {
  if (brightness < 1 || brightness > 100) {
    throw new Error('Brightness must be between 1 and 100');
  }
  const command = {
    msg: {
      cmd: 'brightness',
      data: {
        value: brightness,
      },
    },
  };
  await sendCommand(deviceIp, command);
}

/**
 * Set device color (RGB)
 */
export async function setColor(deviceIp: string, r: number, g: number, b: number): Promise<void> {
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error('RGB values must be between 0 and 255');
  }
  const command = {
    msg: {
      cmd: 'colorwc',
      data: {
        color: { r, g, b },
        colorTemInKelvin: 0,
      },
    },
  };
  await sendCommand(deviceIp, command);
}

/**
 * Set device color temperature (2000-9000 Kelvin)
 */
export async function setColorTemp(deviceIp: string, kelvin: number): Promise<void> {
  if (kelvin < 2000 || kelvin > 9000) {
    throw new Error('Color temperature must be between 2000 and 9000 Kelvin');
  }
  const command = {
    msg: {
      cmd: 'colorwc',
      data: {
        color: { r: 0, g: 0, b: 0 },
        colorTemInKelvin: kelvin,
      },
    },
  };
  await sendCommand(deviceIp, command);
}

/**
 * Build a ptReal command for simple scene control (codes < 256)
 * Scene codes are converted to BLE-style packets sent over LAN
 */
function buildSimpleSceneCommand(sceneCode: number): string {
  // Command prefix: 33 05 04 (scene mode)
  const bytes = new Uint8Array(20);
  bytes[0] = 0x33;
  bytes[1] = 0x05;
  bytes[2] = 0x04;

  // Scene code in little-endian (2 bytes)
  bytes[3] = sceneCode & 0xff;
  bytes[4] = (sceneCode >> 8) & 0xff;

  // Bytes 5-18 are padding (already 0)

  // Calculate XOR checksum of bytes 0-18
  let checksum = 0;
  for (let i = 0; i < 19; i++) {
    checksum ^= bytes[i];
  }
  bytes[19] = checksum;

  // Convert to base64
  return Buffer.from(bytes).toString('base64');
}

/**
 * Build ptReal commands from scenceParam data
 * Long params are split into 20-byte chunks with a3 prefix
 */
function buildParamCommands(paramBase64: string): string[] {
  const paramBytes = Buffer.from(paramBase64, 'base64');
  const commands: string[] = [];

  // Split into chunks of up to 17 bytes (20 - 3 for header)
  // Format: a3 <index> <total> <data...> <checksum>
  const chunkSize = 17;
  const totalChunks = Math.ceil(paramBytes.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = paramBytes.slice(i * chunkSize, (i + 1) * chunkSize);
    const packet = new Uint8Array(20);

    packet[0] = 0xa3;
    packet[1] = i + 1; // 1-indexed chunk number
    packet[2] = totalChunks;

    // Copy chunk data
    for (let j = 0; j < chunk.length; j++) {
      packet[3 + j] = chunk[j];
    }

    // Calculate XOR checksum
    let checksum = 0;
    for (let j = 0; j < 19; j++) {
      checksum ^= packet[j];
    }
    packet[19] = checksum;

    commands.push(Buffer.from(packet).toString('base64'));
  }

  return commands;
}

/**
 * Set device scene by code (for simple built-in scenes)
 */
export async function setScene(deviceIp: string, sceneCode: number): Promise<void> {
  const encodedCommand = buildSimpleSceneCommand(sceneCode);
  const command = {
    msg: {
      cmd: 'ptReal',
      data: {
        command: [encodedCommand],
      },
    },
  };
  await sendCommand(deviceIp, command);
}

/**
 * Set device scene using scenceParam data (for complex scenes)
 */
export async function setSceneParam(deviceIp: string, paramBase64: string): Promise<void> {
  const commands = buildParamCommands(paramBase64);
  const command = {
    msg: {
      cmd: 'ptReal',
      data: {
        command: commands,
      },
    },
  };
  await sendCommand(deviceIp, command);
}
