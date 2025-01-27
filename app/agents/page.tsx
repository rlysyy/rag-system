'use client'

import { useEffect, useState } from 'react'
import { Agent } from '@/types/agent'
import { getAgents } from '@/services/agent'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useDebounce } from '@/hooks/useDebounce'
import { useCopy } from '@/hooks/useCopy'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const copyToClipboard = useCopy({ successMessage: "ID已复制到剪贴板" })

  useEffect(() => {
    async function loadAgents() {
      try {
        setLoading(true)
        const response = await getAgents({
          name: debouncedSearch || undefined
        })
        setAgents(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Failed to load agents:', error)
        setAgents([])
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [debouncedSearch])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agent 列表</h1>
        <div className="w-64">
          <Input
            placeholder="搜索 Agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : !Array.isArray(agents) || agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow 
                  key={agent.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => copyToClipboard(agent.id)}
                >
                  <TableCell className="font-mono text-sm">{agent.id}</TableCell>
                  <TableCell>{agent.title}</TableCell>
                  <TableCell>{new Date(agent.create_date).toLocaleString()}</TableCell>
                  <TableCell>{new Date(agent.update_date).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 