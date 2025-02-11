import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  context: { params: { agentId: string } }
) {
  try {
    // 并行处理请求体和路由参数
    const [body, params] = await Promise.all([
      request.json(),
      Promise.resolve(context.params)
    ])

    console.log('Request received:', {
      method: request.method,
      url: request.url,
      params,
      body
    })

    const url = new URL(`/api/v1/agents/${params.agentId}/completions`, process.env.NEXT_PUBLIC_API_BASE_URL)
    console.log('Target URL:', url.toString())

    const requestConfig = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: body.question,
        stream: true,
        session_id: body.session_id
      })
    }
    console.log('Request config:', {
      ...requestConfig,
      headers: requestConfig.headers,
      body: JSON.parse(requestConfig.body as string)
    })

    const response = await fetch(url, requestConfig)
    console.log('Response status:', response.status)

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 