import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { getEventLog } from '../api/character'
import type { XpEventDto } from '../api/character'
import { usePageTitle } from '../context/usePageTitle'

const SKILL_DESCRIPTIONS: Record<string, { role: string; trains: string }> = {
  Agility: { role: 'Accuracy — determines whether attacks land', trains: 'Daily steps via Health Connect' },
  Endurance: { role: 'Power — determines damage when attacks land', trains: 'Logged workouts' },
  Vitality: { role: 'Defence — reduces incoming boss damage', trains: 'Weight and measurement logs' },
  Discipline: { role: 'Hitpoints — your HP pool in boss fights', trains: 'Daily check-ins and quest completions' },
  Nutrition: { role: 'Fury — chance to deal 1 bonus damage per round', trains: 'Meal check-ins' },
  Hydration: { role: 'Resilience — chance to negate 1 incoming damage per round', trains: 'Logging glasses of water' },
}

const SKILL_COLORS: Record<string, string> = {
  Agility: '#4a9c4a',
  Endurance: '#c43030',
  Vitality: '#4a7ac4',
  Discipline: '#c9a84c',
  Nutrition: '#9c4a9c',
  Hydration: '#4ac4c4',
}

const SOURCE_LABELS: Record<string, string> = {
  StepSync: 'Steps',
  MealLog: 'Meal',
  WorkoutLog: 'Workout',
  WeightLog: 'Weight',
  WaterLog: 'Water',
  QuestComplete: 'Quest',
  BossKill: 'Boss',
  Milestone: 'Milestone',
  ReturnOfHero: 'Return',
  DailyCheckin: 'Check-in',
}

export default function CharacterPage() {
  usePageTitle('Character')
  const { character } = useAuth()
  const [events, setEvents] = useState<XpEventDto[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getEventLog(1, 50)
        setEvents(data)
        setHasMore(data.length === 50)
      } catch (err) {
        console.error('Failed to load event log', err)
      } finally {
        setLoadingEvents(false)
      }
    }
    load()
  }, [])

  async function loadMore() {
    const nextPage = page + 1
    try {
      const data = await getEventLog(nextPage, 50)
      setEvents((prev) => [...prev, ...data])
      setPage(nextPage)
      setHasMore(data.length === 50)
    } catch (err) {
      console.error('Failed to load more events', err)
    }
  }

  if (!character) {
    return (
      <div className="text-(--color-text-muted) italic pt-8">Loading character...</div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Character header */}
      <div className="card p-6 flex items-center justify-between">
        <div>
          <h1 className="text-[2rem] mb-1">{character.name}</h1>
          <p className="text-(--color-text-muted) italic">
            {character.titleEquipped ?? 'Adventurer'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint) mb-1">
            Total Level
          </p>
          <p className="font-display text-[3rem] text-(--color-gold) leading-none">
            {character.totalLevel}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <SectionHeader title="Skills" />
        {character.skills.map((skill) => {
          const color = SKILL_COLORS[skill.skillType] ?? 'var(--color-gold)'
          const desc = SKILL_DESCRIPTIONS[skill.skillType]
          const isExpanded = expandedSkill === skill.skillType
          const progressPercent = skill.xpToNextLevel === 0
            ? 100
            : Math.round((skill.xpIntoCurrentLevel / (skill.xpIntoCurrentLevel + skill.xpToNextLevel)) * 100)

          return (
            <div key={skill.skillType} className="border-b border-(--color-border)">
              <div
                onClick={() => setExpandedSkill(isExpanded ? null : skill.skillType)}
                className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr_80px] gap-3 md:gap-4 items-center min-h-11 px-4 py-3 cursor-pointer hover:bg-(--color-surface-raised) transition-colors duration-150"
              >
                {/* Skill name and level */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <div>
                    <p className="font-display text-[0.8rem] tracking-wider text-(--color-text)">
                      {skill.skillType}
                    </p>
                    <p className="text-[0.75rem] text-(--color-text-muted)">
                      Level {skill.level}
                    </p>
                  </div>
                </div>

                {/* XP progress bar */}
                <div>
                  <div className="h-1.5 bg-(--color-border) rounded-[3px] overflow-hidden mb-[0.3rem]">
                    <div
                      className="h-full rounded-[3px] transition-[width] duration-300"
                      style={{ width: `${progressPercent}%`, background: color }}
                    />
                  </div>
                  <p className="text-[0.75rem] text-(--color-text-faint)">
                    {skill.xpIntoCurrentLevel.toLocaleString()} /
                    {skill.level < 99
                      ? ` ${(skill.xpIntoCurrentLevel + skill.xpToNextLevel).toLocaleString()} XP`
                      : ' MAX'}
                  </p>
                </div>

                {/* Total XP */}
                <div className="text-right hidden md:block">
                  <p className="font-display text-[0.75rem] text-(--color-text-faint) tracking-wider">
                    {skill.totalXP.toLocaleString()}
                  </p>
                  <p className="text-[0.65rem] text-(--color-text-faint)">total xp</p>
                </div>
              </div>

              {/* Expanded skill detail */}
              {isExpanded && desc && (
                <div className="pl-6 md:pl-10 pr-4 pt-3 pb-4 bg-(--color-surface-raised) border-t border-(--color-border) grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint) mb-[0.3rem]">
                      Combat Role
                    </p>
                    <p className="text-[0.9rem] text-(--color-text-muted)">{desc.role}</p>
                  </div>
                  <div>
                    <p className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint) mb-[0.3rem]">
                      How to Train
                    </p>
                    <p className="text-[0.9rem] text-(--color-text-muted)">{desc.trains}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Event log */}
      <div className="card">
        <SectionHeader title="Event Log" />

        {loadingEvents ? (
          <p className="p-4 text-(--color-text-muted) italic text-[0.9rem]">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="p-4 text-(--color-text-muted) italic text-[0.9rem]">
            No events yet. Start logging activity to see your history here.
          </p>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-(--color-border)">
                  {['Time', 'Skill', 'Source', 'XP'].map((col) => (
                    <th
                      key={col}
                      className={`px-3 py-2 font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint) font-normal ${col === 'XP' ? 'text-right' : 'text-left'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const color = SKILL_COLORS[event.skillType] ?? 'var(--color-text-muted)'
                  const isNegative = event.xpAmount < 0
                  return (
                    <tr key={event.id} className="border-b border-(--color-border)">
                      <td className="px-3 py-2 text-[0.8rem] text-(--color-text-faint) whitespace-nowrap">
                        {formatDateTime(event.awardedAt)}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-[0.4rem] text-[0.85rem] text-(--color-text)">
                          <span
                            className="w-[6px] h-[6px] rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          {event.skillType}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[0.85rem] text-(--color-text-muted)">
                        {SOURCE_LABELS[event.source] ?? event.source}
                      </td>
                      <td className={`px-3 py-2 text-right font-display text-[0.85rem] ${isNegative ? 'text-(--color-red-bright)' : 'text-(--color-gold)'}`}>
                        {isNegative ? '' : '+'}{event.xpAmount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {hasMore && (
              <div className="p-3 text-center">
                <button
                  onClick={loadMore}
                  className="bg-transparent border border-(--color-border-bright) rounded-xs text-(--color-text-muted) px-4 py-[0.4rem] cursor-pointer font-display text-[0.75rem] tracking-widest uppercase transition-all duration-150 hover:border-(--color-gold-dim) hover:text-(--color-text)"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-3 py-[0.6rem] border-b border-(--color-border) flex items-center gap-2">
      <div className="w-[3px] h-[14px] bg-(--color-gold) rounded-[1px] shrink-0" />
      <span className="font-display text-[0.75rem] tracking-[0.12em] uppercase text-(--color-text-muted) font-semibold">
        {title}
      </span>
    </div>
  )
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
