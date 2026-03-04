import {
  discoverDevices,
  getDeviceStatus,
  turnDevice,
  setBrightness,
  setColor,
  setColorTemp,
  setScene,
  setSceneParam,
} from '../lib/govee/lan';

// Your H6022 weather station
const TARGET_MAC = '5C:E7:53:6D:D1:94';
const TARGET_IP = '192.168.12.196';

const colors: Record<string, { r: number; g: number; b: number }> = {
  red: { r: 255, g: 0, b: 0 },
  orange: { r: 255, g: 117, b: 23 },
  yellow: { r: 255, g: 255, b: 0 },
  green: { r: 0, g: 255, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  purple: { r: 128, g: 0, b: 255 },
  pink: { r: 255, g: 105, b: 180 },
  white: { r: 255, g: 255, b: 255 },
  // Weather colors
  sunny: { r: 255, g: 200, b: 50 },
  cloudy: { r: 180, g: 180, b: 180 },
  rainy: { r: 70, g: 130, b: 200 },
  stormy: { r: 128, g: 0, b: 255 },
};

// Scene codes from Govee API for H6022
// Scenes with param need the full param data, simple scenes just need the code
const scenes: Record<string, { code: number; param?: string }> = {
  // Natural - simple (no param needed)
  rainbow: { code: 42 },
  forest: { code: 44 },
  ocean: { code: 43 },
  wave: { code: 46 },
  snowflake: { code: 41 },
  fire: { code: 40 },
  'white-light': { code: 99 },
  reading: { code: 35 },
  'night-light': { code: 38 },
  // Natural - complex (need param data)
  sunrise: { code: 8478, param: 'QQEBAWQAAasAA50ABhI6hv8AAQIDBAUGBwgJCgsMDhASFBYY+K2dDQ8RExUXGBkaGxwdHh8gISIjJCYoKiwuMP++CyUnKSstLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RWWFpcXgb/fwBVV1lbXV8S+1YHYGFiY2RlZmdoaWprbG5wcnR2Ev8AAG1vcXN1d3h5ent8fX5/gIGCg0tkAwAB//8AAAAA' },
  sunset: { code: 8479, param: 'QQEBAWQAAa8AA6EABxj/AAAAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcS9wAAGBkaGxwdHh8gISIjJCYoKiwuHvtWByUnKSstLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGRwz/fwBISUpLTE1OT1BRUlMY/5UFVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprDP++C2xtbm9wcXJzdHV2dwz/4BZ4eXp7fH1+f4CBgoMyZAMAAf//AAAAAA==' },
  aurora: { code: 8481, param: 'QQD/AGQAAi0AAx8AARoAAP8LFRYgISorLDQ1Nj4/QElKS1VdYGdocnN8fVFkBgAB//8AAAAAIgADFAABD4sA/xchIiwtNjc4Qmhpc3R+f1lkBgAB//8AAAAA' },
  raining: { code: 8487, param: 'QQDQjjAAAxwAAw4AAQn///8OITVBU1VhaHRkZAIAAf//AAAAACUAAxcAARL///9sb3B0dXZ4eXp7fH1+f4CBgoNGNgMAAv//AAAAACUAAxcAARL///9sb3B0dXZ4eXp7fH1+f4CBgoNGNgQAAv//AAAAAA==' },
  sky: { code: 8483, param: 'QQZy/0EAA2kAA1sAAxgAAP8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhckAIj/SUtNT1FTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG5wcnR2Ev///21vcXN1d3h5ent8fX5/gIGCgx5kAwAC//8AAAAAHgADEAABC////01OT1BWV1hZc3R1VWQEAAH//wAAAAAkAAMWAAER////QkNETE1OT1BcXV5gYWJub3BVZAMAAf//AAAAAA==' },
  firefly: { code: 8484, param: 'QQBbJDIAAxgAAwoAAQXj5RYOF05VdTxQAAAC//8AAAAAFwADCQABBL/SAA4iYWg3MgcAAf//AAAAABYAAwgAAQP/0gAfSV9LWgQAAf//AAAAAA==' },
  spring: { code: 8492, param: 'QQEBAUYAA30AA28ABQv/ANYlJiorLC8wNDU5Ohj/fwAxMjY3PD0+P0BBQkNERUZHSElNTlFSWl4M/wAAMzg7SktMT1BTVVldC///AFRWWFxfYGFiZmlqIAD/AFdbY2RlZ2hrbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDPGQEAAH//wAAAABTAANFAAIY//8AAAECAwQFBgcICQoLDA0ODxAREhMUFRYXJP//ZhgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6O0ZkAwAD//8AAAAAKwADHQABGP//AAABAgMEBQYHCAkKCwwNDg8QERITFBUWF1BkAgAB//8AAAAA' },
  summer: { code: 8493, param: 'QQEBAWQAAn8AA3EABB4x/5MAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcZGx0fISMY//BsGBocHiAiJCUmJygpKissLS4vSElKS0xNHv/wkDAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR05PUFFSUwz/zEFUVVZXWFlaW1xdXl8yZAQAAf//AAAAAGYAA1gAAyH/fwAuMDQ5Ojs8PT9AQURFRkdISUpLTE1OT1BRUlNUVlhaXF4a/18oVVdZW11fYGFiY2RlZmdoaWprbG1ub3BxcnMQ+1YHdHV2d3h5ent8fX5/gIGCg1FYAwAB//8AAAAA' },
  fall: { code: 8494, param: 'QQEBAS8AAxYAAwgAAQP/fwAcaGxWZAIAAv//AAAAACUAAxcAARL/fwAAAQIDBAUGBwgJCgsNDxETFRcyZAMAAf//AAAAABgAAwoAAQX/hgAKJkVlgkJEBwAB//8AAAAA' },
  winter: { code: 8495, param: 'QQEBAWQAAxsAAw0AAQj///8LEiY6TlRwdVpkAgAB//8AAAAAGAADCgABBf///xQZQWJ1S2QCAAH//wAAAACrAAOdAAYMGgD/AAECAwQFBgcICQoLNgAA/wwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Oz0/QUNFRyoGcv88PkBCREZISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamsE2+TubHBxcwY6hv9tbnJ1dncO////b3R4eXp7fH1+f4CBgoNGRgMAAv//AAAAAA==' },
  lake: { code: 8496, param: 'QQEBAUIAAz8AAzEAASwAAP9ET1BRVVpbXF1eYGFiZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg0tfBAAC//8AAAAAFwADCQABBP//AA8QGxxLZAMAAf//AAAAAGsAA10AAhgA0I4AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhc8JdtdGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTMmQDAAP//wAAAAA=' },
};

async function main() {
  const arg = process.argv[2];
  const value = process.argv[3];

  if (!arg) {
    console.log('Usage:');
    console.log('  npx tsx scripts/test-lan.ts discover         - Find devices on network');
    console.log('  npx tsx scripts/test-lan.ts status           - Get device status');
    console.log('  npx tsx scripts/test-lan.ts on               - Turn on');
    console.log('  npx tsx scripts/test-lan.ts off              - Turn off');
    console.log('  npx tsx scripts/test-lan.ts brightness <1-100>');
    console.log('  npx tsx scripts/test-lan.ts color <name>     - red, orange, yellow, green, blue, purple, pink, white');
    console.log('  npx tsx scripts/test-lan.ts color <r> <g> <b>');
    console.log('  npx tsx scripts/test-lan.ts temp <2000-9000> - Color temp in Kelvin');
    console.log('  npx tsx scripts/test-lan.ts scene <name>     - Set a scene');
    console.log('  npx tsx scripts/test-lan.ts scenes           - List all scenes');
    console.log('  npx tsx scripts/test-lan.ts demo             - Cycle through colors');
    console.log('\nWeather colors: sunny, cloudy, rainy, stormy');
    console.log('Popular scenes: rainbow, aurora, fire, ocean, raining, sunset');
    return;
  }

  // Find the device
  if (arg === 'discover') {
    console.log('Scanning for Govee devices on LAN...\n');
    const devices = await discoverDevices(5000);
    if (devices.length === 0) {
      console.log('No devices found. Make sure LAN control is enabled in the Govee app.');
      return;
    }
    console.log(`Found ${devices.length} device(s):\n`);
    for (const device of devices) {
      const macMatch = device.device.toUpperCase().replace(/:/g, '') === TARGET_MAC.replace(/:/g, '');
      console.log(`${macMatch ? '>>> ' : ''}Device: ${device.sku}`);
      console.log(`    MAC: ${device.device}`);
      console.log(`    IP: ${device.ip}`);
      console.log(`    BLE: ${device.bleVersionSoft} / WiFi: ${device.wifiVersionSoft}`);
      console.log();
    }
    return;
  }

  // Use the known IP address directly
  const deviceIp = TARGET_IP;
  console.log(`Using device at ${deviceIp}\n`);

  if (arg === 'status') {
    const status = await getDeviceStatus(deviceIp);
    if (status) {
      console.log('Device Status:');
      console.log(`  Power: ${status.onOff === 1 ? 'on' : 'off'}`);
      console.log(`  Brightness: ${status.brightness}%`);
      if (status.color) {
        console.log(`  Color: rgb(${status.color.r}, ${status.color.g}, ${status.color.b})`);
      }
      if (status.colorTemInKelvin) {
        console.log(`  Color Temp: ${status.colorTemInKelvin}K`);
      }
    } else {
      console.log('Could not get device status');
    }
  } else if (arg === 'on') {
    await turnDevice(deviceIp, true);
    console.log('Turned on!');
  } else if (arg === 'off') {
    await turnDevice(deviceIp, false);
    console.log('Turned off!');
  } else if (arg === 'brightness' && value) {
    await setBrightness(deviceIp, parseInt(value, 10));
    console.log(`Brightness set to ${value}%`);
  } else if (arg === 'color') {
    if (value && value in colors) {
      const c = colors[value];
      await setColor(deviceIp, c.r, c.g, c.b);
      console.log(`Color set to ${value}`);
    } else if (value && process.argv[4] && process.argv[5]) {
      const r = parseInt(value, 10);
      const g = parseInt(process.argv[4], 10);
      const b = parseInt(process.argv[5], 10);
      await setColor(deviceIp, r, g, b);
      console.log(`Color set to rgb(${r}, ${g}, ${b})`);
    } else {
      console.log('Available colors:', Object.keys(colors).join(', '));
    }
  } else if (arg === 'temp' && value) {
    await setColorTemp(deviceIp, parseInt(value, 10));
    console.log(`Color temperature set to ${value}K`);
  } else if (arg === 'scene') {
    if (value && value in scenes) {
      const scene = scenes[value];
      if (scene.param) {
        await setSceneParam(deviceIp, scene.param);
      } else {
        await setScene(deviceIp, scene.code);
      }
      console.log(`Scene set to ${value}`);
    } else if (value) {
      const code = parseInt(value, 10);
      if (!Number.isNaN(code)) {
        await setScene(deviceIp, code);
        console.log(`Scene set to code ${code}`);
      } else {
        console.log(`Unknown scene: ${value}`);
        console.log('Available scenes:', Object.keys(scenes).join(', '));
      }
    } else {
      console.log('Available scenes:', Object.keys(scenes).join(', '));
    }
  } else if (arg === 'scenes') {
    console.log('Available scenes:\n');
    for (const [name, scene] of Object.entries(scenes)) {
      const type = scene.param ? 'complex' : 'simple';
      console.log(`  ${name.padEnd(20)} (${type})`);
    }
  } else if (arg === 'demo') {
    console.log('Running color demo...\n');
    for (const [name, c] of Object.entries(colors)) {
      console.log(`Setting ${name}...`);
      await setColor(deviceIp, c.r, c.g, c.b);
      await new Promise((r) => setTimeout(r, 2000));
    }
    console.log('\nDemo complete!');
  }
}

main().catch(console.error);
