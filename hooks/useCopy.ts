import { useToast } from "@/hooks/use-toast"

interface UseCopyOptions {
  successMessage?: string
  errorMessage?: string
  duration?: number
}

export function useCopy(options: UseCopyOptions = {}) {
  const { toast } = useToast()
  const {
    successMessage = "已复制到剪贴板",
    errorMessage = "复制失败",
    duration = 2000
  } = options

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        description: successMessage,
        duration
      })
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        variant: "destructive",
        description: errorMessage,
        duration
      })
      return false
    }
  }

  return copyToClipboard
} 