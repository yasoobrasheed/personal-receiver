// Weather to Govee H6022 scene mapping

import type { WeatherCategory } from './categorize';
import type { H6022SceneName } from '../govee/devices/H6022';

// Scenes used for weather mapping
export type WeatherSceneName = 'rainbow' | 'snowflake' | 'starry-sky' | 'wave';

/**
 * Maps weather categories to H6022 scene names
 */
export function getSceneForWeather(category: WeatherCategory): H6022SceneName {
  switch (category) {
    // Clear/partly cloudy → Rainbow
    case 'sunny':
    case 'clear':
    case 'partly_cloudy':
      return 'rainbow';

    // Overcast/cloudy → Snowflake
    case 'overcast':
    case 'cloudy':
      return 'snowflake';

    // Atmospheric conditions → Starry Sky
    case 'fog':
    case 'mist':
    case 'windy':
    case 'unknown':
      return 'starry-sky';

    // Precipitation → Wave
    case 'drizzle':
    case 'light_rain':
    case 'moderate_rain':
    case 'heavy_rain':
    case 'thunderstorm':
    case 'snow':
    case 'sleet':
      return 'wave';
  }
}

/**
 * Weather category groups for display/logging purposes
 */
export const WEATHER_SCENE_GROUPS: Record<WeatherSceneName, readonly WeatherCategory[]> = {
  rainbow: ['sunny', 'clear', 'partly_cloudy'],
  snowflake: ['overcast', 'cloudy'],
  'starry-sky': ['fog', 'mist', 'windy', 'unknown'],
  wave: [
    'drizzle',
    'light_rain',
    'moderate_rain',
    'heavy_rain',
    'thunderstorm',
    'snow',
    'sleet',
  ],
};
