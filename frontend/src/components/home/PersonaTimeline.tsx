import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import type { TimelineItem } from '@/data'

interface PersonaTimelineProps {
  items: TimelineItem[]
  color: string
}

export function PersonaTimeline({ items, color }: PersonaTimelineProps) {
  const { i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'

  // Group items by year
  const groupedItems = useMemo(() => {
    const groups: { year: string | { en: string; tr: string }; items: TimelineItem[] }[] = []

    items.forEach((item) => {
      // Create a stable key for comparison
      const itemYearKey = typeof item.year === 'string' ? item.year : item.year.en

      const existingGroup = groups.find((g) => {
        const groupYearKey = typeof g.year === 'string' ? g.year : g.year.en
        return groupYearKey === itemYearKey
      })

      if (existingGroup) {
        existingGroup.items.push(item)
      } else {
        groups.push({ year: item.year, items: [item] })
      }
    })

    return groups
  }, [items])

  return (
    <section className="py-6 px-4">
      <div className="container-custom">
        <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 md:p-6">
          {/* Desktop: Horizontal Timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Timeline Line */}
              <div
                className="absolute top-3 left-0 right-0 h-0.5 bg-gray-700"
                style={{
                  background: `linear-gradient(to right, ${color}20, ${color}40, ${color}20)`,
                }}
              />

              {/* Timeline Items */}
              <div className="flex justify-between relative">
                {groupedItems.map((group, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center group"
                    style={{ flex: 1 }}
                  >
                    {/* Dot */}
                    <div
                      className="w-6 h-6 rounded-full border-2 bg-gray-900 flex items-center justify-center transition-all duration-300 group-hover:scale-125 z-10"
                      style={{
                        borderColor: color,
                        boxShadow: `0 0 12px ${color}50`,
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>

                    {/* Content */}
                    <div className="mt-3 max-w-[140px]">
                      <div
                        className="text-sm font-bold mb-2"
                        style={{ color }}
                      >
                        {typeof group.year === 'string'
                          ? group.year
                          : isEnglish
                            ? group.year.en
                            : group.year.tr}
                      </div>

                      {/* List of courses for this year */}
                      <div className="flex flex-col gap-3">
                        {group.items.map((item) => (
                          <div key={item.id}>
                            <div className="text-xs font-medium text-white leading-tight">
                              {isEnglish ? item.title.en : item.title.tr}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                              {isEnglish ? item.subtitle.en : item.subtitle.tr}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical Timeline */}
          <div className="md:hidden">
            <div className="relative pl-6">
              {/* Vertical Line */}
              <div
                className="absolute left-2 top-0 bottom-0 w-0.5"
                style={{
                  background: `linear-gradient(to bottom, ${color}40, ${color}20)`,
                }}
              />

              {/* Timeline Items */}
              <div className="space-y-6">
                {groupedItems.map((group, index) => (
                  <div key={index} className="relative flex items-start gap-3">
                    {/* Dot */}
                    <div
                      className="absolute -left-4 w-4 h-4 rounded-full border-2 bg-gray-900 flex items-center justify-center mt-1"
                      style={{
                        borderColor: color,
                        boxShadow: `0 0 8px ${color}40`,
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-bold mb-1"
                        style={{ color }}
                      >
                        {typeof group.year === 'string'
                          ? group.year
                          : isEnglish
                            ? group.year.en
                            : group.year.tr}
                      </div>

                      {/* List of courses for this year */}
                      <div className="space-y-3">
                        {group.items.map((item) => (
                          <div key={item.id} className="border-l-2 border-gray-800 pl-3">
                            <div className="text-sm font-medium text-white">
                              {isEnglish ? item.title.en : item.title.tr}
                            </div>
                            <div className="text-xs text-gray-500">
                              {isEnglish ? item.subtitle.en : item.subtitle.tr}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
