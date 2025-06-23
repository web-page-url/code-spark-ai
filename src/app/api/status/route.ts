import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString(),
    message: 'AI Coding Assistant API is running perfectly! 🚀',
    endpoints: {
      chat: '/api/chat',
      status: '/api/status',
    },
    features: [
      'Real-time AI responses',
      'Progress tracking',
      'Error handling',
      'Rate limiting',
      'Mock responses for development',
    ],
    health: {
      api: 'healthy',
      database: 'not configured',
      ai_service: 'ready',
    }
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
} 