This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Weather-Triggered Govee Lighting

This project includes a daemon that changes a Govee H6022 light based on weather conditions.

### Weather → Scene Mapping

| Weather | Scene |
|---------|-------|
| sunny, clear | Rainbow |
| partly_cloudy, cloudy | Snowflake |
| overcast, fog, mist, windy, unknown | Starry Sky |
| rain, drizzle, thunderstorm, snow, sleet | Wave |

The light only updates between **6:00 AM** and **30 minutes before sunset**.

### Running the Weather Daemon

**Test once:**
```bash
npx tsx scripts/test-weather-scene.ts
```

**Run as background daemon (polls every 5 min):**
```bash
npx tsx scripts/weather-daemon.ts
```

### macOS LaunchAgent (auto-start on login)

The daemon is configured as a launchd service at `~/Library/LaunchAgents/com.weather.daemon.plist`.

**Check status:**
```bash
launchctl list | grep weather
```

**View logs:**
```bash
tail -f ~/Library/Logs/weather-daemon.log
```

**Stop daemon:**
```bash
launchctl unload ~/Library/LaunchAgents/com.weather.daemon.plist
```

**Start daemon:**
```bash
launchctl load ~/Library/LaunchAgents/com.weather.daemon.plist
```

**Restart daemon:**
```bash
launchctl unload ~/Library/LaunchAgents/com.weather.daemon.plist && \
launchctl load ~/Library/LaunchAgents/com.weather.daemon.plist
```

### Environment Variables

Required in `.env.local`:
```
WEATHER_API_API_KEY=your_weatherapi_key
WEATHER_LOCATION_LAT_LONG=30.0,-120.0
GOVEE_H6022_IP=123.123.12.123
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
