import { type NextRequest, NextResponse } from 'next/server';
import { categorizeWeather } from '@/lib/weather/categorize';
import { fetchCurrentWeather } from '@/lib/weather/client';
import { getSceneForWeather } from '@/lib/weather/scenes';
import { isWithinLightingWindow } from '@/lib/weather/timeWindow';
import { createH6022 } from '@/lib/govee/devices/H6022';

// H6022 device configuration from environment
const H6022_IP = process.env.GOVEE_H6022_IP || '192.168.12.196';

export async function GET(request: NextRequest) {
  // Verify Vercel Cron signature (automatically set by Vercel)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const weather = await fetchCurrentWeather();
    const categorized = categorizeWeather(weather.current);

    // Check if we're within the lighting window (6am to 30 min before sunset)
    const timeWindow = await isWithinLightingWindow();

    const response: Record<string, unknown> = {
      location: {
        name: weather.location.name,
        region: weather.location.region,
        country: weather.location.country,
        localTime: weather.location.localtime,
        timezone: weather.location.tz_id,
      },
      weather: categorized,
      timeWindow,
    };

    // Only trigger scene if within allowed time window
    if (timeWindow.allowed) {
      const sceneName = getSceneForWeather(categorized.category);
      const h6022 = createH6022(H6022_IP);

      try {
        await h6022.setScene(sceneName);
        response.scene = {
          triggered: true,
          name: sceneName,
          device: 'H6022',
        };
        console.log(
          `[Cron] Weather: ${categorized.category} → Scene: ${sceneName}`,
        );
      } catch (sceneError) {
        response.scene = {
          triggered: false,
          name: sceneName,
          error: sceneError instanceof Error ? sceneError.message : 'Unknown error',
        };
        console.error('[Cron] Failed to set scene:', sceneError);
      }
    } else {
      response.scene = {
        triggered: false,
        reason: timeWindow.reason,
      };
      console.log(`[Cron] Scene skipped: ${timeWindow.reason}`);
    }

    console.log('[Cron] Weather polled:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Weather cron error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weather',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
