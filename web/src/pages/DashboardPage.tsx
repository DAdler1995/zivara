import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/useAuth'
import { getTodayActivity, checkIn, logWater, removeLastWater } from '../api/activity'
import { getDailyQuests } from '../api/quests'
import { getJarSummary } from '../api/rewards'
import type { TodayActivityResponse } from '../api/activity'
import type { DailyQuestsResponse } from '../api/quests'
import type { JarSummaryResponse } from '../api/rewards'
import LogMealModal from '../components/LogMealModal'
import LogWorkoutModal from '../components/LogWorkoutModal'
import LogWeightModal from '../components/LogWeightModal'

export default function DashboardPage() {
  const { character } = useAuth()
  const [activity, setActivity] = useState<TodayActivityResponse | null>(null)
  const [quests, setQuests] = useState<DailyQuestsResponse | null>(null)
  const [jar, setJar] = useState<JarSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [activityData, questsData, jarData] = await Promise.all([
        getTodayActivity(),
        getDailyQuests(),
        getJarSummary(),
      ])
      setActivity(activityData)
      setQuests(questsData)
      setJar(jarData)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    } finally {
      setLoading(false)
    }
  }, [])

useEffect(() => {
  let cancelled = false

  async function load() {
    try {
      const [activityData, questsData, jarData] = await Promise.all([
        getTodayActivity(),
        getDailyQuests(),
        getJarSummary(),
      ])
      if (cancelled) return
      setActivity(activityData)
      setQuests(questsData)
      setJar(jarData)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  load()
  return () => { cancelled = true }
}, [])

  async function handleCheckIn() {
    try {
      await checkIn()
      await loadData()
    } catch {
      // already checked in today
    }
  }

  async function handleWaterTap(glassIndex: number) {
    if (!activity) return
    const filled = glassIndex < activity.waterGlassesToday
    try {
      if (filled) {
        await removeLastWater()
      } else {
        await logWater({ glasses: 1 })
      }
      await loadData()
    } catch (err) {
      console.error('Water log failed', err)
    }
  }

  if (loading) {
    return (
      <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', paddingTop: '2rem' }}>
        The realm is loading...
      </div>
    )
  }

  const weekPercent = jar ? Math.round(jar.currentWeekUnlockedPercent * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          {character?.name}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Total Level {character?.totalLevel} — {getGreeting()}
        </p>
      </div>

      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Daily quests */}
        <div style={cardStyle}>
          <SectionHeader title="Daily Quests" />
          {quests?.quests.map((quest) => (
            <div
              key={quest.id}
              style={{
                padding: '0.75rem',
                borderBottom: '1px solid var(--color-border)',
                opacity: quest.status === 'Completed' ? 0.5 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: quest.status === 'Completed'
                      ? 'var(--color-green-bright)'
                      : 'var(--color-gold-dim)',
                  }}
                >
                  {quest.skillTarget}
                  {quest.status === 'Completed' && ' — Complete'}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                  {quest.currentValue}/{quest.targetValue}
                </span>
              </div>
              <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {quest.description}
              </p>
              {/* Progress bar */}
              <div style={{
                marginTop: '0.5rem',
                height: '3px',
                background: 'var(--color-border)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (quest.currentValue / quest.targetValue) * 100)}%`,
                  background: quest.status === 'Completed'
                    ? 'var(--color-green-bright)'
                    : 'var(--color-gold)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          ))}
          {quests?.allCompleted && (
            <p style={{
              padding: '0.75rem',
              color: 'var(--color-green-bright)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}>
              All quests complete. Well done, adventurer.
            </p>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Water tracker */}
          <div style={cardStyle}>
            <SectionHeader title="Hydration" />
            <div style={{ padding: '0.75rem' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {activity?.waterGlassesToday ?? 0} of 8 glasses today
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const filled = i < (activity?.waterGlassesToday ?? 0)
                  return (
                    <button
                      key={i}
                      onClick={() => handleWaterTap(i)}
                      title={filled ? 'Remove last glass' : 'Log a glass'}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '2px',
                        border: `1px solid ${filled ? 'var(--color-gold)' : 'var(--color-border-bright)'}`,
                        background: filled ? 'var(--color-gold)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {filled ? '💧' : '○'}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reward jar */}
          <div style={cardStyle}>
            <SectionHeader title="Reward Jar" />
            <div style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Total unlocked
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-gold)',
                  fontSize: '1.1rem',
                }}>
                  ${jar?.totalUnlockedBalance.toFixed(2) ?? '0.00'}
                </span>
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    This week
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {weekPercent}% — ${jar?.currentWeekUnlockedAmount.toFixed(2) ?? '0.00'} of ${jar?.currentWeekMaxEarn.toFixed(2) ?? '50.00'}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'var(--color-border)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${weekPercent}%`,
                    background: 'linear-gradient(90deg, var(--color-gold-dim), var(--color-gold))',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
              <p style={{ color: 'var(--color-text-faint)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                {jar?.dailyQuestDaysCompletedThisWeek ?? 0}/7 quest days this week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={cardStyle}>
        <SectionHeader title="Log Activity" />
        <div style={{
          padding: '0.75rem',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <ActionButton
            label="Check In"
            done={activity?.checkedInToday}
            onClick={handleCheckIn}
          />
          <ActionButton
            label="Log Meal"
            onClick={() => setShowMealModal(true)}
          />
          <ActionButton
            label="Log Workout"
            onClick={() => setShowWorkoutModal(true)}
          />
          <ActionButton
            label="Log Weight"
            onClick={() => setShowWeightModal(true)}
          />
        </div>
      </div>

      {/* Today's summary */}
      <div style={cardStyle}>
        <SectionHeader title="Today" />
        <div style={{
          padding: '0.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
        }}>
          <Stat label="Steps" value={activity?.stepsToday.toLocaleString() ?? '0'} />
          <Stat label="Meals Logged" value={String(activity?.mealsLoggedToday ?? 0)} />
          <Stat
            label="Check-in"
            value={activity?.checkedInToday ? 'Done' : 'Not yet'}
            highlight={activity?.checkedInToday}
          />
        </div>
      </div>

      {/* Modals */}
      {showMealModal && (
        <LogMealModal
          onClose={() => setShowMealModal(false)}
          onSuccess={() => { setShowMealModal(false); loadData() }}
        />
      )}
      {showWorkoutModal && (
        <LogWorkoutModal
          onClose={() => setShowWorkoutModal(false)}
          onSuccess={() => { setShowWorkoutModal(false); loadData() }}
        />
      )}
      {showWeightModal && (
        <LogWeightModal
          onClose={() => setShowWeightModal(false)}
          onSuccess={() => { setShowWeightModal(false); loadData() }}
        />
      )}
    </div>
  )
}

// Helper components

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      padding: '0.6rem 0.75rem',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <div style={{
        width: '3px',
        height: '14px',
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
        {title}
      </span>
    </div>
  )
}

function ActionButton({
  label,
  done,
  onClick,
}: {
  label: string
  done?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '0.5rem 1rem',
        border: `1px solid ${done ? 'var(--color-green-bright)' : 'var(--color-border-bright)'}`,
        borderRadius: '2px',
        background: done ? 'rgba(42, 92, 42, 0.3)' : 'transparent',
        color: done ? 'var(--color-green-bright)' : 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!done) {
          e.currentTarget.style.borderColor = 'var(--color-gold-dim)'
          e.currentTarget.style.color = 'var(--color-text)'
        }
      }}
      onMouseLeave={(e) => {
        if (!done) {
          e.currentTarget.style.borderColor = 'var(--color-border-bright)'
          e.currentTarget.style.color = 'var(--color-text-muted)'
        }
      }}
    >
      {done ? `✓ ${label}` : label}
    </button>
  )
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--color-text-faint)',
        marginBottom: '0.25rem',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '1.25rem',
        color: highlight ? 'var(--color-green-bright)' : 'var(--color-text)',
        fontFamily: 'var(--font-display)',
      }}>
        {value}
      </p>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  overflow: 'hidden',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'The morning road awaits.'
  if (hour < 17) return 'The afternoon stretches ahead.'
  return 'The evening watch begins.'
}