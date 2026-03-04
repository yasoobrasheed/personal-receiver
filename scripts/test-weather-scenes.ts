import { setScene, setSceneParam } from '../lib/govee/lan';

const TARGET_IP = '192.168.12.196';

// Weather to scene mappings
const weatherScenes = [
  { weather: 'Sunny', scene: 'rainbow', code: 42 },
  { weather: 'Cloudy', scene: 'sky', param: 'QQZy/0EAA2kAA1sAAxgAAP8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhckAIj/SUtNT1FTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG5wcnR2Ev///21vcXN1d3h5ent8fX5/gIGCgx5kAwAC//8AAAAAHgADEAABC////01OT1BWV1hZc3R1VWQEAAH//wAAAAAkAAMWAAER////QkNETE1OT1BcXV5gYWJub3BVZAMAAf//AAAAAA==' },
  { weather: 'Light Rain', scene: 'lake', param: 'QQEBAUIAAz8AAzEAASwAAP9ET1BRVVpbXF1eYGFiZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg0tfBAAC//8AAAAAFwADCQABBP//AA8QGxxLZAMAAf//AAAAAGsAA10AAhgA0I4AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhc8JdtdGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTMmQDAAP//wAAAAA=' },
  { weather: 'Medium Rain', scene: 'winter', param: 'QQEBAWQAAxsAAw0AAQj///8LEiY6TlRwdVpkAgAB//8AAAAAGAADCgABBf///xQZQWJ1S2QCAAH//wAAAACrAAOdAAYMGgD/AAECAwQFBgcICQoLNgAA/wwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Oz0/QUNFRyoGcv88PkBCREZISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamsE2+TubHBxcwY6hv9tbnJ1dncO////b3R4eXp7fH1+f4CBgoNGRgMAAv//AAAAAA==' },
  { weather: 'Rainy', scene: 'wave', code: 46 },
  { weather: 'Windy', scene: 'spring-wind', param: 'QQEBAWQAAqcAA5kABVsA/wAAAQIDBAYHCgsMDQ4PEhQVFhcYGRodHh8gISIjJCgpKissLzEyMzQ1Njc6Ozw9Pj9AREVGR0hJSktPUFFUVVpbXF9gZGVmZ2tub3BxcnV2d3h5ent8fX+AgYKDC///AAUQERwnUl1oaXN+E/8AAAgJExslJi0uMDg5QkNNTlhiY20GMf+TQUxWV2FsBf9/AFNZXmp0V10GAAL//wAAAAAqAAMcAAIKAP//CRQfKjVAS1ZhbAly/3IjLjlERU9QW2ZcZAYAAf//AAAAAA==' },
];

async function test() {
  console.log('Testing weather → scene mappings (5 seconds each)\n');

  for (const item of weatherScenes) {
    console.log(`${item.weather} → ${item.scene}`);
    if (item.param) {
      await setSceneParam(TARGET_IP, item.param);
    } else if (item.code) {
      await setScene(TARGET_IP, item.code);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log('\nDone!');
}

test().catch(console.error);
