import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // ข้อมูลประจำตัวของคุณ (พิกเซลและกุญแจ)
    const PIXEL_ID = '2302102800316332'; 
    const ACCESS_TOKEN = 'EAARGKuVqqFwBRJolxn1BfaeUsBuixXIRcX9DNf2cgLzlEKZBgZBwfBTZBO6Jo7IFae4nNs6dZCNr2KBOUWi1bLv7LDmiQSoqocZBGH8NtED9Y6WBRMKBTwaWanFFDBncgzZAzCTpx8R38UQ22A6cUafJxvDxGZCE0ISDICkewZCFWIY3g71SC2mR2kaJ1b6NTJFxmAZDZD';

    // เตรียมแพ็คเกจข้อมูลส่งให้ Facebook
    const fbRequest = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: body.eventName || 'PageView', // ชื่อเหตุการณ์ เช่น PageView, Purchase
            event_time: Math.floor(Date.now() / 1000), // เวลาปัจจุบัน
            action_source: 'website',
            user_data: {
              // เก็บ IP และประเภทเบราว์เซอร์เพื่อความแม่นยำ
              client_ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
              client_user_agent: request.headers.get('user-agent'),
            },
            event_id: body.eventId // รหัสป้องกันการนับซ้ำ (Deduplication)
          }
        ]
      }),
    });

    const responseData = await fbRequest.json();
    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}