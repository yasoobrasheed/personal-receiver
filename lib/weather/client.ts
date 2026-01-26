import type { WeatherResponse, WeatherAPIError } from './types';

const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

export class WeatherAPIClientError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'WeatherAPIClientError';
  }
}

export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherResponse> {
  const apiKey = process.env.WEATHER_API_API_KEY;

  if (!apiKey) {
    throw new WeatherAPIClientError('WEATHER_API_API_KEY environment variable is not set', 0);
  }

  const url = new URL(`${WEATHER_API_BASE_URL}/current.json`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('q', `${lat},${lng}`);
  url.searchParams.set('aqi', 'no');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = (await response.json()) as WeatherAPIError;
    throw new WeatherAPIClientError(
      errorData.error?.message || `HTTP ${response.status}`,
      errorData.error?.code || 0,
      response.status
    );
  }

  return response.json() as Promise<WeatherResponse>;
}
