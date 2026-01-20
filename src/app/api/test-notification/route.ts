import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const notificationPayload = {
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      headings: { en: "Test Notification" },
      contents: { en: "This is a test notification from your Departmental Portal!" },
      included_segments: ["All"],
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return NextResponse.json(
        { error: 'Failed to send notification', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      message: 'Notification sent successfully!',
      recipients: data.recipients,
      id: data.id
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending notification' },
      { status: 500 }
    );
  }
}
