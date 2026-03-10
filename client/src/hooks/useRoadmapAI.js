import { useState } from 'react'

export default function useRoadmapAI(student, roadmap) {
  const initialMessage = student?.name
    ? `Hey ${student.name} — you're on Phase ${student.currentPhase || 1} of ${student.domain || 'your domain'}. What's slowing you down, or what do you want to adjust?`
    : 'Hey! Tell me about what you want to adjust in your roadmap.'

  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialMessage }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [messagesRemaining, setMessagesRemaining] = useState(
    student?.ai_messages_today != null ? Math.max(0, 10 - student.ai_messages_today) : 10
  )

  const sendMessage = async (userMessage) => {
    if (messagesRemaining <= 0) return
    if (!userMessage.trim()) return

    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiBase}/api/roadmap-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          student: {
            name: student?.name,
            year: student?.year_of_study,
            domain: student?.domain,
            profile_type: student?.profile_type,
            current_phase: student?.currentPhase || 1,
            completed_tasks: student?.phase_progress || {},
            days_active: student?.streak_days || 0,
          },
          roadmap,
        }),
      })

      if (!response.ok) {
        throw new Error('AI request failed')
      }

      const data = await response.json()
      setMessages([...newMessages, { role: 'assistant', content: data.content }])
      setMessagesRemaining(prev => Math.max(0, prev - 1))

      // Parse and return changes if any
      if (data.changes) {
        return data.changes
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I had trouble processing that. Try again in a moment.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return { messages, sendMessage, isLoading, messagesRemaining }
}
