import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    let apiUrl = 'http://localhost:8000/api/segment';
    
    if (process.env.NODE_ENV !== 'development') {
      try {
        const urlRes = await fetch('https://raw.githubusercontent.com/narutopop0225-droid/BovWeightAi/main/tunnel_url.txt', { cache: 'no-store' });
        const tunnelBaseUrl = (await urlRes.text()).trim();
        apiUrl = `${tunnelBaseUrl}/api/segment`;
      } catch (e) {
        console.error('Failed to fetch tunnel url', e);
        apiUrl = 'https://bov-weight-ai.loca.lt/api/segment'; // fallback
      }
    }
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying to AI backend:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
