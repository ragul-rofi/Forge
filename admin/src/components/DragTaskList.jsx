import { useState } from 'react'
import { GripVertical, X, Plus } from 'lucide-react'

export default function DragTaskList({ tasks, onChange, domainColor }) {
  const [dragIndex, setDragIndex] = useState(null)

  const handleDragStart = (index) => {
    setDragIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    const updated = [...tasks]
    const [dragged] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, dragged)
    onChange(updated)
    setDragIndex(index)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
  }

  const updateTask = (index, value) => {
    const updated = [...tasks]
    updated[index] = value
    onChange(updated)
  }

  const removeTask = (index) => {
    onChange(tasks.filter((_, i) => i !== index))
  }

  const addTask = () => {
    onChange([...tasks, ''])
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <div
          key={i}
          className="flex items-center gap-2 group"
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDragEnd={handleDragEnd}
          style={{
            opacity: dragIndex === i ? 0.5 : 1,
          }}
        >
          <GripVertical
            size={14}
            className="cursor-grab shrink-0 opacity-40 group-hover:opacity-100"
            style={{ color: 'var(--muted)' }}
          />
          <input
            type="text"
            value={task}
            onChange={(e) => updateTask(i, e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-md text-sm"
            style={{
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              outline: 'none',
            }}
            placeholder="Task description..."
          />
          <button
            onClick={() => removeTask(i)}
            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: '#f43f5e', background: 'none', border: 'none' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addTask}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
        style={{
          color: domainColor || 'var(--accent)',
          background: 'none',
          border: `1px dashed ${domainColor || 'var(--border)'}`,
        }}
      >
        <Plus size={12} />
        Add Task
      </button>
    </div>
  )
}
