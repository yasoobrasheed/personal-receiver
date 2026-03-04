// Time window utilities for weather-triggered lighting
// Only triggers between 6am and 30 minutes before sunset
// Uses timezone from Weather API based on WEATHER_LOCATION_LAT_LONG (supports zip codes like "94109")

import { fetchAstronomy } from './client';

interface SunsetCache {
  date: string; // YYYY-MM-DD
  sunsetTime: Date;
  timezone: string;
}

// In-memory cache for sunset time (refreshed daily)
let sunsetCache: SunsetCache | null = null;

// Default timezone for PST/PDT
const DEFAULT_TIMEZONE = 'America/Los_Angeles';

/**
 * Parse time string like "07:30 PM" to Date object for today
 */
function parseTimeToDate(timeStr: string, dateStr: string): Date {
  const [time, period] = timeStr.split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutesStr}:00`);
}

/**
 * Get today's date string in YYYY-MM-DD format for a timezone
 */
function getTodayString(timezone: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
}

/**
 * Get current time in hours and minutes for a timezone
 */
function getCurrentTimeInZone(timezone: string): { hours: number; minutes: number } {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Fetch and cache today's sunset time
 * Timezone is automatically determined from Weather API response
 */
export async function getSunsetTime(): Promise<{ sunsetTime: Date; timezone: string }> {
  // Use cached timezone or default for getting today's date
  const timezone = sunsetCache?.timezone || DEFAULT_TIMEZONE;
  const today = getTodayString(timezone);

  // Return cached value if it's still valid for today
  if (sunsetCache && sunsetCache.date === today) {
    return { sunsetTime: sunsetCache.sunsetTime, timezone: sunsetCache.timezone };
  }

  // Fetch fresh astronomy data (uses WEATHER_LOCATION_LAT_LONG which can be a zip code)
  const astronomy = await fetchAstronomy(today);
  const tz = astronomy.location.tz_id;
  const sunsetTime = parseTimeToDate(astronomy.astronomy.astro.sunset, today);

  // Update cache
  sunsetCache = {
    date: today,
    sunsetTime,
    timezone: tz,
  };

  console.log(
    `[TimeWindow] Cached sunset for ${astronomy.location.name}: ${astronomy.astronomy.astro.sunset} (${tz})`,
  );

  return { sunsetTime, timezone: tz };
}

export interface TimeWindowResult {
  allowed: boolean;
  reason?: string;
  currentTime: string;
  windowStart: string;
  windowEnd: string;
  timezone: string;
}

/**
 * Check if current time is within the allowed window (6am to 30 min before sunset)
 * Timezone is automatically determined from Weather API based on configured location
 */
export async function isWithinLightingWindow(): Promise<TimeWindowResult> {
  const { sunsetTime, timezone } = await getSunsetTime();

  // Get current time in the location's timezone
  const { hours: currentHour, minutes: currentMinutes } = getCurrentTimeInZone(timezone);
  const currentTimeMinutes = currentHour * 60 + currentMinutes;

  // Window: 6:00 AM to 30 min before sunset
  const startMinutes = 6 * 60; // 6:00 AM
  const sunsetHour = sunsetTime.getHours();
  const sunsetMinute = sunsetTime.getMinutes();
  const endMinutes = sunsetHour * 60 + sunsetMinute - 30;

  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  const currentTimeStr = formatTime(currentHour, currentMinutes);
  const windowStartStr = '06:00';
  const windowEndStr = formatTime(Math.floor(endMinutes / 60), endMinutes % 60);

  if (currentTimeMinutes < startMinutes) {
    return {
      allowed: false,
      reason: `Before 6:00 AM (current: ${currentTimeStr})`,
      currentTime: currentTimeStr,
      windowStart: windowStartStr,
      windowEnd: windowEndStr,
      timezone,
    };
  }

  if (currentTimeMinutes >= endMinutes) {
    return {
      allowed: false,
      reason: `After ${windowEndStr} (30 min before sunset)`,
      currentTime: currentTimeStr,
      windowStart: windowStartStr,
      windowEnd: windowEndStr,
      timezone,
    };
  }

  return {
    allowed: true,
    currentTime: currentTimeStr,
    windowStart: windowStartStr,
    windowEnd: windowEndStr,
    timezone,
  };
}

/**
 * Clear the sunset cache (useful for testing)
 */
export function clearSunsetCache(): void {
  sunsetCache = null;
}
