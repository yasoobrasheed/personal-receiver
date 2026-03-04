// Local HTTP proxy server for weather-triggered Govee control
// Run this on a machine on your local network, then expose via Cloudflare Tunnel or ngrok

import { config } from 'dotenv';
config({ path: '.env.local' });

import http from 'node:http';
import { fetchCurrentWeather } from '../lib/weather/client';
import { categorizeWeather } from '../lib/weather/categorize';
import { getSceneForWeather } from '../lib/weather/scenes';
import { isWithinLightingWindow } from '../lib/weather/timeWindow';
import { createH6022 } from '../lib/govee/devices/H6022';

const PORT = process.env.PROXY_PORT || 3001;
const AUTH_TOKEN = process.env.PROXY_AUTH_TOKEN; // Optional auth token
const H6022_IP = process.env.GOVEE_H6022_IP || '192.168.12.196';

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Content-Type', 'application/json');

  // Auth check
  if (AUTH_TOKEN) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${AUTH_TOKEN}`) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Weather trigger endpoint
  if (req.url === '/trigger' && req.method === 'GET') {
    try {
      console.log(`[${new Date().toISOString()}] Trigger requested`);

      const weather = await fetchCurrentWeather();
      const categorized = categorizeWeather(weather.current);
      const timeWindow = await isWithinLightingWindow();

      const response: Record<string, unknown> = {
        location: weather.location.name,
        condition: weather.current.condition.text,
        temperature: weather.current.temp_f,
        category: categorized.category,
        timeWindow,
      };

      if (timeWindow.allowed) {
        const sceneName = getSceneForWeather(categorized.category);
        const h6022 = createH6022(H6022_IP);

        await h6022.setScene(sceneName);
        response.scene = { triggered: true, name: sceneName };
        console.log(`  → Weather: ${categorized.category} → Scene: ${sceneName}`);
      } else {
        response.scene = { triggered: false, reason: timeWindow.reason };
        console.log(`  → Skipped: ${timeWindow.reason}`);
      }

      res.writeHead(200);
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Failed to trigger',
        message: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
    return;
  }

  // Force scene endpoint (bypasses time window)
  if (req.url?.startsWith('/scene/') && req.method === 'GET') {
    const sceneName = req.url.replace('/scene/', '') as Parameters<typeof createH6022>[0];
    try {
      const h6022 = createH6022(H6022_IP);
      await h6022.setScene(sceneName as any);
      console.log(`[${new Date().toISOString()}] Forced scene: ${sceneName}`);
      res.writeHead(200);
      res.end(JSON.stringify({ scene: sceneName, triggered: true }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Failed to set scene',
        message: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`\n🌤️  Weather Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Device IP: ${H6022_IP}`);
  console.log(`   Auth: ${AUTH_TOKEN ? 'enabled' : 'disabled'}`);
  console.log('\nEndpoints:');
  console.log('  GET /health  - Health check');
  console.log('  GET /trigger - Fetch weather & update light (respects time window)');
  console.log('  GET /scene/:name - Force a specific scene\n');
  console.log('To expose via Cloudflare Tunnel:');
  console.log(`  cloudflared tunnel --url http://localhost:${PORT}\n`);
});
