export class SDCAIService implements AIService {
  private controller: AbortController | null = null;

  async processMessage(
    message: string,
    sessionId: string,
    onProgress: (data: { answer: string; references?: DocumentReference[] }) => void
  ) {
    try {
      this.controller = new AbortController();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Cancel-Previous': 'true'
        },
        body: JSON.stringify({
          message,
          sessionId,
          abortSignal: true
        }),
        signal: this.controller.signal
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done || this.controller === null) {
          await reader.cancel();
          await fetch('/api/chat/abort', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId
            })
          }).catch(console.error);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const data = JSON.parse(line);
            onProgress(data);
          } catch (e) {
            console.error('Error parsing line:', line, e);
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error in processMessage:', error);
      }
    } finally {
      this.controller = null;
    }
  }

  abort() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
} 