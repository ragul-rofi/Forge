import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import useRoadmapAI from '../../hooks/useRoadmapAI'

const QUICK_PROMPTS = [
  "I'm stuck on my current phase",
  'I know Python already',
  'I only have 1hr/day',
  'I have 3 months to placement',
]

export default function AIPersonalizer({ student, roadmap, onRoadmapChange }) {
  const { messages, sendMessage, isLoading, messagesRemaining } = useRoadmapAI(student, roadmap)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const msg = input
    setInput('')
    const changes = await sendMessage(msg)
    if (changes && onRoadmapChange) {
      onRoadmapChange(changes)
    }
  }

  const handleQuickPrompt = async (prompt) => {
    if (isLoading) return
    const changes = await sendMessage(prompt)
    if (changes && onRoadmapChange) {
      onRoadmapChange(changes)
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Your AI Roadmap Guide
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded font-medium"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--muted)' }}
          >
            BETA
          </span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {messagesRemaining}/10 left today
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="px-5 py-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: 320, minHeight: 160 }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed"
              style={{
                backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-xl px-4 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg)', color: 'var(--muted)' }}>
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-5 py-3" style={{ borderColor: 'var(--border)' }}>
        {messagesRemaining > 0 ? (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 rounded-lg cursor-pointer transition-opacity"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                }}
              >
                <Send size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-center py-2" style={{ color: 'var(--muted)' }}>
            You've used all 10 messages for today. Come back tomorrow!
          </p>
        )}
      </div>
    </div>
  )
}
