import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { getEventLog } from '../api/character'
import type { XpEventDto } from '../api/character'

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
      <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        Loading character...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Character header */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            {character.name}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            {character.titleEquipped ?? 'Adventurer'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-faint)',
            marginBottom: '0.25rem',
          }}>
            Total Level
          </p>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            color: 'var(--color-gold)',
            lineHeight: 1,
          }}>
            {character.totalLevel}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '0.6rem 0.75rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <div style={{
            width: '3px', height: '14px',
            background: 'var(--color-gold)',
            borderRadius: '1px',
          }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}>
            Skills
          </span>
        </div>

        {character.skills.map((skill) => {
          const color = SKILL_COLORS[skill.skillType] ?? 'var(--color-gold)'
          const desc = SKILL_DESCRIPTIONS[skill.skillType]
          const isExpanded = expandedSkill === skill.skillType
          const progressPercent = skill.xpToNextLevel === 0
            ? 100
            : Math.round((skill.xpIntoCurrentLevel / (skill.xpIntoCurrentLevel + skill.xpToNextLevel)) * 100)

          return (
            <div
              key={skill.skillType}
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div
                onClick={() => setExpandedSkill(isExpanded ? null : skill.skillType)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 80px',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--color-surface-raised)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                {/* Skill name and level */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0,
                  }} />
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.8rem',
                      letterSpacing: '0.05em',
                      color: 'var(--color-text)',
                    }}>
                      {skill.skillType}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                    }}>
                      Level {skill.level}
                    </p>
                  </div>
                </div>

                {/* XP progress bar */}
                <div>
                  <div style={{
                    height: '6px',
                    background: 'var(--color-border)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '0.3rem',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: color,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <p style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-text-faint)',
                  }}>
                    {skill.xpIntoCurrentLevel.toLocaleString()} /
                    {skill.level < 99
                      ? ` ${(skill.xpIntoCurrentLevel + skill.xpToNextLevel).toLocaleString()} XP`
                      : ' MAX'}
                  </p>
                </div>

                {/* Total XP */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.7rem',
                    color: 'var(--color-text-faint)',
                    letterSpacing: '0.05em',
                  }}>
                    {skill.totalXP.toLocaleString()}
                  </p>
                  <p style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-faint)',
                  }}>
                    total xp
                  </p>
                </div>
              </div>

              {/* Expanded skill detail */}
              {isExpanded && desc && (
                <div style={{
                  padding: '0.75rem 1rem 1rem 2.5rem',
                  background: 'var(--color-surface-raised)',
                  borderTop: '1px solid var(--color-border)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}>
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-faint)',
                      marginBottom: '0.3rem',
                    }}>
                      Combat Role
                    </p>
                    <p style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '0.9rem',
                    }}>
                      {desc.role}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-faint)',
                      marginBottom: '0.3rem',
                    }}>
                      How to Train
                    </p>
                    <p style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '0.9rem',
                    }}>
                      {desc.trains}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Event log */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '0.6rem 0.75rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <div style={{
            width: '3px', height: '14px',
            background: 'var(--color-gold)',
            borderRadius: '1px',
          }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}>
            Event Log
          </span>
        </div>

        {loadingEvents ? (
          <p style={{
            padding: '1rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            fontSize: '0.9rem',
          }}>
            Loading events...
          </p>
        ) : events.length === 0 ? (
          <p style={{
            padding: '1rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            fontSize: '0.9rem',
          }}>
            No events yet. Start logging activity to see your history here.
          </p>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Time', 'Skill', 'Source', 'XP'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '0.5rem 0.75rem',
                        textAlign: col === 'XP' ? 'right' : 'left',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-faint)',
                        fontWeight: 400,
                      }}
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
                    <tr
                      key={event.id}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-faint)',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatDateTime(event.awardedAt)}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.85rem',
                          color: 'var(--color-text)',
                        }}>
                          <span style={{
                            width: '6px', height: '6px',
                            borderRadius: '50%',
                            background: color,
                            flexShrink: 0,
                          }} />
                          {event.skillType}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                      }}>
                        {SOURCE_LABELS[event.source] ?? event.source}
                      </td>
                      <td style={{
                        padding: '0.5rem 0.75rem',
                        textAlign: 'right',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.85rem',
                        color: isNegative
                          ? 'var(--color-red-bright)'
                          : 'var(--color-gold)',
                      }}>
                        {isNegative ? '' : '+'}{event.xpAmount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {hasMore && (
              <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                <button
                  onClick={loadMore}
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-border-bright)',
                    borderRadius: '2px',
                    color: 'var(--color-text-muted)',
                    padding: '0.4rem 1rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-gold-dim)'
                    e.currentTarget.style.color = 'var(--color-text)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-bright)'
                    e.currentTarget.style.color = 'var(--color-text-muted)'
                  }}
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

function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}