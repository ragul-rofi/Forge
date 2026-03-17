import { useMemo } from 'react'
import { DOMAIN_COLORS, DOMAIN_NAMES } from '../../lib/constants'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

export default function IncomeTimeline({ primaryDomain, secondaryDomain }) {
  const timelineData = useMemo(() => {
    const timelines = {
      cloud:      { jobReady: 5, firstRaise: 11, twoYear: '₹10–20L' },
      fullstack:  { jobReady: 8, firstRaise: 14, twoYear: '₹12–25L' },
      data:       { jobReady: 4, firstRaise: 10, twoYear: '₹10–18L' },
      ai:         { jobReady: 15, firstRaise: 21, twoYear: '₹18–40L' },
      cyber:      { jobReady: 6, firstRaise: 12, twoYear: '₹12–22L' },
      design:     { jobReady: 3.5, firstRaise: 9, twoYear: '₹8–16L' },
      networking: { jobReady: 5, firstRaise: 11, twoYear: '₹8–15L' },
      business:   { jobReady: 5, firstRaise: 11, twoYear: '₹12–22L' },
      devops:     { jobReady: 6, firstRaise: 12, twoYear: '₹15–28L' },
      blockchain: { jobReady: 7.5, firstRaise: 13, twoYear: '₹12–30L' },
      iot:        { jobReady: 6, firstRaise: 12, twoYear: '₹10–20L' },
      genai:      { jobReady: 5, firstRaise: 11, twoYear: '₹20–40L' },
      devrel:     { jobReady: 4, firstRaise: 10, twoYear: '₹12–25L' },
    }

    const domains = [primaryDomain]
    if (secondaryDomain && secondaryDomain !== primaryDomain) {
      domains.push(secondaryDomain)
    }

    return domains.map(d => ({
      domain: d,
      name: DOMAIN_NAMES[d] || d,
      color: DOMAIN_COLORS[d] || '#888',
      ...(timelines[d] || { jobReady: 6, firstRaise: 12, twoYear: '—' }),
    }))
  }, [primaryDomain, secondaryDomain])

  return (
    <div className="card p-5">
      <h4 className="section-label mb-4">Income Timeline</h4>
      <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
        Months from start to milestones
      </p>

      <div className="space-y-5">
        {timelineData.map(item => (
          <div key={item.domain}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {item.name}
              </span>
            </div>

            <div className="relative h-8 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              {/* Job ready bar */}
              <div
                className="absolute top-0 h-full rounded-l-lg flex items-center justify-end pr-2"
                style={{
                  backgroundColor: `${item.color}40`,
                  width: `${(item.jobReady / 24) * 100}%`,
                  minWidth: '40px',
                }}
              >
                <span className="text-[10px] font-medium" style={{ color: item.color }}>
                  Job ready
                </span>
              </div>

              {/* First raise bar */}
              <div
                className="absolute top-0 h-full flex items-center justify-end pr-2"
                style={{
                  backgroundColor: `${item.color}25`,
                  width: `${(item.firstRaise / 24) * 100}%`,
                  minWidth: '60px',
                }}
              >
                <span className="text-[10px] font-medium" style={{ color: item.color }}>
                  1st raise
                </span>
              </div>

              {/* 2yr salary label */}
              <div
                className="absolute top-0 right-2 h-full flex items-center"
              >
                <span className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>
                  2yr: {item.twoYear}
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-1 text-[10px]" style={{ color: 'var(--muted)' }}>
              <span>Month 0</span>
              <span>Month {item.jobReady}</span>
              <span>Month {item.firstRaise}</span>
              <span>24mo</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
