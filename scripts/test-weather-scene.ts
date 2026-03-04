import { config } from 'dotenv';
config({ path: '.env.local' });
import { fetchCurrentWeather } from '../lib/weather/client';
import { categorizeWeather } from '../lib/weather/categorize';
import { getSceneForWeather } from '../lib/weather/scenes';
import { isWithinLightingWindow } from '../lib/weather/timeWindow';
import { createH6022 } from '../lib/govee/devices/H6022';

const H6022_IP = process.env.GOVEE_H6022_IP || '192.168.12.196';

async function test() {
  console.log('=== Fetching Weather ===');
  const weather = await fetchCurrentWeather();
  console.log('Location:', weather.location.name, weather.location.region);
  console.log('Condition:', weather.current.condition.text);
  console.log('Temp:', weather.current.temp_f + '°F');

  console.log('\n=== Categorizing ===');
  const categorized = categorizeWeather(weather.current);
  console.log('Category:', categorized.category);

  const scene = getSceneForWeather(categorized.category);
  console.log('Scene:', scene);

  console.log('\n=== Time Window ===');
  const timeWindow = await isWithinLightingWindow();
  console.log('Timezone:', timeWindow.timezone);
  console.log('Current time:', timeWindow.currentTime);
  console.log('Window:', timeWindow.windowStart, '-', timeWindow.windowEnd);
  console.log('Allowed:', timeWindow.allowed);
  if (!timeWindow.allowed) {
    console.log('Reason:', timeWindow.reason);
  }

  console.log('\n=== Setting Scene ===');
  const h6022 = createH6022(H6022_IP);
  await h6022.setScene(scene);
  console.log('Scene set to:', scene);
}

test().catch(console.error);
