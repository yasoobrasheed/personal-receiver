import type { CurrentWeather } from './types';

export type WeatherCategory =
  | 'sunny'
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'mist'
  | 'drizzle'
  | 'light_rain'
  | 'moderate_rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'sleet'
  | 'windy'
  | 'unknown';

export interface CategorizedWeather {
  category: WeatherCategory;
  temperature: {
    fahrenheit: number;
    feels_like_fahrenheit: number;
  };
}

export function categorizeWeather(current: CurrentWeather): CategorizedWeather {
  const conditionText = current.condition.text.toLowerCase();
  let category: WeatherCategory = 'unknown';

  if (conditionText === 'sunny') {
    category = 'sunny';
  } else if (conditionText === 'clear') {
    category = 'clear';
  } else if (
    conditionText.includes('partly cloudy') ||
    conditionText.includes('partly sunny')
  ) {
    category = 'partly_cloudy';
  } else if (conditionText === 'cloudy') {
    category = 'cloudy';
  } else if (conditionText === 'overcast') {
    category = 'overcast';
  } else if (conditionText.includes('fog')) {
    category = 'fog';
  } else if (conditionText === 'mist') {
    category = 'mist';
  } else if (conditionText.includes('thunder')) {
    category = 'thunderstorm';
  } else if (
    conditionText.includes('heavy rain') ||
    conditionText.includes('torrential')
  ) {
    category = 'heavy_rain';
  } else if (conditionText.includes('moderate rain')) {
    category = 'moderate_rain';
  } else if (
    conditionText.includes('light rain') ||
    conditionText.includes('patchy rain')
  ) {
    category = 'light_rain';
  } else if (conditionText.includes('drizzle')) {
    category = 'drizzle';
  } else if (
    conditionText.includes('snow') ||
    conditionText.includes('blizzard')
  ) {
    category = 'snow';
  } else if (conditionText.includes('sleet') || conditionText.includes('ice')) {
    category = 'sleet';
  }

  if (current.wind_kph > 50 && category !== 'thunderstorm') {
    category = 'windy';
  }

  return {
    category,
    temperature: {
      fahrenheit: current.temp_f,
      feels_like_fahrenheit: current.feelslike_f,
    },
  };
}
