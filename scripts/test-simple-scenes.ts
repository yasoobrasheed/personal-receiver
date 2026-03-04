import { setScene } from '../lib/govee/lan';

const TARGET_IP = '192.168.12.196';

// All simple scenes (no param needed)
const simpleScenes = [
  { name: 'rainbow', code: 42 },
  { name: 'forest', code: 44 },
  { name: 'ocean', code: 43 },
  { name: 'wave', code: 46 },
  { name: 'snow-flake', code: 41 },
  { name: 'fire', code: 40 },
  { name: 'white-light', code: 99 },
  { name: 'reading', code: 35 },
  { name: 'night-light', code: 38 },
  { name: 'joyful', code: 45 },
  { name: 'starry-sky', code: 47 },
];

async function test() {
  console.log('Testing all 11 simple scenes (5 seconds each)\n');

  for (const scene of simpleScenes) {
    console.log(`${scene.name} (code: ${scene.code})`);
    await setScene(TARGET_IP, scene.code);
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log('\nDone!');
}

test().catch(console.error);
