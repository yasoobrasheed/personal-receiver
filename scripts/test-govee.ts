import { config } from 'dotenv';
import { getDeviceState, listDevices } from '../lib/govee/client';
import { createH6046, MODEL as H6046_MODEL } from '../lib/govee/devices/H6046';
import { parseStateProperties } from '../lib/govee/state';

// Load .env.local before calling any functions
config({ path: '.env.local' });

async function main() {
  console.log('Fetching Govee devices...\n');

  const devices = await listDevices();

  if (devices.length === 0) {
    console.log('No devices found.');
    return;
  }

  console.log(`Found ${devices.length} device(s):\n`);

  for (const device of devices) {
    console.log(`Device: ${device.deviceName}`);
    console.log(`  MAC: ${device.device}`);
    console.log(`  Model: ${device.model}`);
    console.log(`  Controllable: ${device.controllable}`);
    console.log(`  Retrievable: ${device.retrievable}`);
    console.log(`  Commands: ${device.supportCmds.join(', ')}`);

    if (device.retrievable) {
      try {
        const rawState = await getDeviceState(device.device, device.model);
        const state = parseStateProperties(rawState.properties);
        console.log(`  State:`);
        console.log(`    online: ${state.online}`);
        console.log(`    powerState: ${state.powerState}`);
        if (state.brightness !== undefined) {
          console.log(`    brightness: ${state.brightness}`);
        }
        if (state.color) {
          console.log(`    color: rgb(${state.color.r}, ${state.color.g}, ${state.color.b})`);
        }
        if (state.colorTem !== undefined) {
          console.log(`    colorTem: ${state.colorTem}`);
        }
        if (state.colorTemInKelvin !== undefined) {
          console.log(`    colorTemInKelvin: ${state.colorTemInKelvin}K`);
        }
      } catch (err) {
        console.log(`  State: (error fetching: ${err})`);
      }
    }

    console.log();

    // Demo: Use device-specific class for H6046 Light Bars
    if (device.model === H6046_MODEL) {
      const light = createH6046(device.device);
      console.log(`  [H6046 API] Using typed device class`);
      const typedState = await light.getState();
      console.log(`    Power: ${typedState.powerState}, Brightness: ${typedState.brightness}%`);
      console.log(`  Available methods: turnOn(), turnOff(), setBrightness(0-100), setColor(r,g,b), setColorTemp(K)`);
      console.log();
    }
  }
}

main().catch(console.error);
