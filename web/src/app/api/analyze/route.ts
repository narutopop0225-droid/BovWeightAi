import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8000/api/segment' 
      : 'https://bov-weight-ai.loca.lt/api/segment';

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
