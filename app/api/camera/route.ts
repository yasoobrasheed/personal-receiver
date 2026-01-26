import { type NextRequest, NextResponse } from 'next/server';

interface CameraEventPayload {
  event: 'camera_on' | 'camera_off';
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CameraEventPayload;

    if (!payload.event || !['camera_on', 'camera_off'].includes(payload.event)) {
      return NextResponse.json(
        { error: 'Invalid event. Expected "camera_on" or "camera_off"' },
        { status: 400 },
      );
    }

    const isOn = payload.event === 'camera_on';
    const timestamp = new Date().toISOString();

    // Log camera state (lights control can be added later)
    console.log(`[Camera] ${timestamp} - Camera ${isOn ? 'ON' : 'OFF'}`);

    return NextResponse.json({
      success: true,
      event: payload.event,
      timestamp,
    });
  } catch (error) {
    console.error('Camera webhook error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process camera event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
