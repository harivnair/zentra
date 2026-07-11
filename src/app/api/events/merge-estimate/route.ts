import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';

export async function POST(req: NextRequest) {
  try {
    const { eventId, estimateId, ...body } = await req.json();

    if (!eventId || !estimateId) {
      return NextResponse.json(
        { error: 'eventId and estimateId are required in request body' },
        { status: 400 },
      );
    }

    if (!BACKEND_BASE_URL) {
      return NextResponse.json(
        { error: 'Backend URL is not configured' },
        { status: 500 },
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_BASE_URL}/events/${encodeURIComponent(eventId)}/merge-estimate/${encodeURIComponent(estimateId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const text = await backendResponse.text();
    const contentType = backendResponse.headers.get('content-type') || 'application/json';
    const responseData = contentType.includes('application/json') ? JSON.parse(text || '{}') : text;

    return new NextResponse(
      typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
      {
        status: backendResponse.status,
        headers: { 'Content-Type': contentType },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to merge estimate',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
