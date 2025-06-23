import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test endpoint working! 🚀',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'POST request received successfully! ✅',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to parse request body',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
} 