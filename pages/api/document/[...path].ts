import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path, ...queryParams } = req.query
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SDC_Document_URL
    const queryString = new URLSearchParams(queryParams as Record<string, string>).toString()
    const url = `${baseUrl}/document/${path}?${queryString}`

    // 直接重定向到文件 URL
    res.redirect(url)
  } catch (error) {
    console.error('Document proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch document' })
  }
} 