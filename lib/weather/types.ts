// WeatherAPI.com response types
// These types ensure compile-time safety if the API response changes

export interface WeatherLocation {
  readonly name: string;
  readonly region: string;
  readonly country: string;
  readonly lat: number;
  readonly lon: number;
  readonly tz_id: string;
  readonly localtime_epoch: number;
  readonly localtime: string;
}

export interface WeatherCondition {
  readonly text: string;
  readonly icon: string;
  readonly code: number;
}

export interface CurrentWeather {
  readonly last_updated_epoch: number;
  readonly last_updated: string;
  readonly temp_c: number;
  readonly temp_f: number;
  readonly is_day: number;
  readonly condition: WeatherCondition;
  readonly wind_mph: number;
  readonly wind_kph: number;
  readonly wind_degree: number;
  readonly wind_dir: string;
  readonly pressure_mb: number;
  readonly pressure_in: number;
  readonly precip_mm: number;
  readonly precip_in: number;
  readonly humidity: number;
  readonly cloud: number;
  readonly feelslike_c: number;
  readonly feelslike_f: number;
  readonly vis_km: number;
  readonly vis_miles: number;
  readonly uv: number;
  readonly gust_mph: number;
  readonly gust_kph: number;
}

export interface WeatherResponse {
  readonly location: WeatherLocation;
  readonly current: CurrentWeather;
}

export interface WeatherAPIError {
  readonly error: {
    readonly code: number;
    readonly message: string;
  };
}

// Astronomy API types
export interface Astronomy {
  readonly sunrise: string; // e.g., "06:45 AM"
  readonly sunset: string; // e.g., "07:30 PM"
  readonly moonrise: string;
  readonly moonset: string;
  readonly moon_phase: string;
  readonly moon_illumination: number;
}

export interface AstronomyResponse {
  readonly location: WeatherLocation;
  readonly astronomy: {
    readonly astro: Astronomy;
  };
}
