// Weather daemon - polls weather and updates Govee every 5 minutes
// Run this on a machine on your local network
// Usage: npx tsx scripts/weather-daemon.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { fetchCurrentWeather } from '../lib/weather/client';
import { categorizeWeather } from '../lib/weather/categorize';
import { getSceneForWeather } from '../lib/weather/scenes';
import { isWithinLightingWindow, clearSunsetCache } from '../lib/weather/timeWindow';
import { createH6022 } from '../lib/govee/devices/H6022';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const H6022_IP = process.env.GOVEE_H6022_IP || '192.168.12.196';

let lastScene: string | null = null;

async function poll() {
  const timestamp = new Date().toLocaleTimeString();

  try {
    const weather = await fetchCurrentWeather();
    const categorized = categorizeWeather(weather.current);
    const timeWindow = await isWithinLightingWindow();

    if (!timeWindow.allowed) {
      console.log(`[${timestamp}] Outside window: ${timeWindow.reason}`);
      return;
    }

    const sceneName = getSceneForWeather(categorized.category);

    // Only update if scene changed
    if (sceneName === lastScene) {
      console.log(`[${timestamp}] ${weather.current.condition.text} (${categorized.category}) → ${sceneName} (unchanged)`);
      return;
    }

    const h6022 = createH6022(H6022_IP);
    await h6022.setScene(sceneName);
    lastScene = sceneName;

    console.log(`[${timestamp}] ${weather.current.condition.text} (${categorized.category}) → ${sceneName} ✓`);
  } catch (error) {
    console.error(`[${timestamp}] Error:`, error instanceof Error ? error.message : error);
  }
}

// Schedule midnight cache clear
function scheduleMidnightClear() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight

  const msUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Midnight - clearing sunset cache`);
    clearSunsetCache();
    lastScene = null; // Also reset scene so it re-applies after midnight
    scheduleMidnightClear(); // Schedule next midnight
  }, msUntilMidnight);

  console.log(`   Next cache clear: ${midnight.toLocaleString()}`);
}

console.log(`\n🌤️  Weather Daemon Started`);
console.log(`   Device: ${H6022_IP}`);
console.log(`   Polling every ${POLL_INTERVAL_MS / 1000 / 60} minutes`);

// Schedule midnight cache clear
scheduleMidnightClear();

console.log(`   Press Ctrl+C to stop\n`);

// Initial poll
poll();

// Schedule recurring polls
setInterval(poll, POLL_INTERVAL_MS);
