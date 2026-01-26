import { type NextRequest, NextResponse } from 'next/server';
import { categorizeWeather } from '@/lib/weather/categorize';
import { fetchCurrentWeather } from '@/lib/weather/client';

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

    const response = {
      location: {
        name: weather.location.name,
        region: weather.location.region,
        country: weather.location.country,
        localTime: weather.location.localtime,
      },
      weather: categorized,
    };

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
