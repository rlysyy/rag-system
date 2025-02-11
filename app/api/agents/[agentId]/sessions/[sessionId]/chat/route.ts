import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string; sessionId: string } }
) {
  try {
    const body = await request.json()
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/agents/${params.agentId}/sessions/${params.sessionId}/chat`
    
    console.log('Chat API Request:', {
      url,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body
    })
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    console.log('Chat API Response:', data)

    if (!response.ok) {
      console.error('Chat API Error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to send message' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 