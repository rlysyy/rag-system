import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  console.log('Creating session for agent:', params.agentId)
  
  try {
    const url = new URL(`/api/v1/agents/${params.agentId}/sessions`, process.env.NEXT_PUBLIC_API_BASE_URL)
    console.log('Session creation URL:', url.toString())

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    console.log('Session creation response:', data)

    if (!response.ok) {
      console.error('Session creation failed:', data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
} 