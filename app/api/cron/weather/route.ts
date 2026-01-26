import { NextRequest, NextResponse } from 'next/server';
import { fetchCurrentWeather } from '@/lib/weather/client';
import { categorizeWeather } from '@/lib/weather/categorize';
import { parseLatLng } from '@/lib/weather/utils';

export async function GET(request: NextRequest) {
  // Verify Vercel Cron signature (automatically set by Vercel)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.WEATHER_LOCATION_LAT_LONG) {
    return NextResponse.json({ error: 'WEATHER_LOCATION_LAT_LONG environment variable is not set' }, { status: 500 });
  }

  try {
    const { lat, lng } = parseLatLng(process.env.WEATHER_LOCATION_LAT_LONG);
    const weather = await fetchCurrentWeather(lat, lng);
    const categorized = categorizeWeather(weather.current);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      location: {
        name: weather.location.name,
        region: weather.location.region,
        country: weather.location.country,
        localTime: weather.location.localtime,
      },
      weather: categorized,
    };

    console.log(
      JSON.stringify({
        event: 'weather_polled',
        location: weather.location.name,
        category: categorized.category,
        temp_f: categorized.temperature.fahrenheit,
        timestamp: response.timestamp,
      })
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Weather cron error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weather',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
