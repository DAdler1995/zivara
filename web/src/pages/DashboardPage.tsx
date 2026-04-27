import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../context/usePageTitle'
import { getTodayActivity, checkIn, logWater, removeLastWater, getGoogleFitStatus, getGoogleFitAuthUrl, triggerGoogleFitSync, disconnectGoogleFit } from '../api/activity'
import { getDailyQuests } from '../api/quests'
import { getJarSummary } from '../api/rewards'
import type { TodayActivityResponse, GoogleFitStatusResponse } from '../api/activity'
import type { DailyQuestsResponse } from '../api/quests'
import type { JarSummaryResponse } from '../api/rewards'
import { STEP_GOALS, SkillType } from '@zivara/shared'
import LogMealModal from '../components/LogMealModal'
import LogWorkoutModal from '../components/LogWorkoutModal'
import LogWeightModal from '../components/LogWeightModal'
import LogStepsModal from '../components/LogStepsModal'

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { character, refreshCharacter } = useAuth()
  const [activity, setActivity] = useState<TodayActivityResponse | null>(null)
  const [quests, setQuests] = useState<DailyQuestsResponse | null>(null)
  const [jar, setJar] = useState<JarSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [showStepsModal, setShowStepsModal] = useState(false)
  const [googleFitStatus, setGoogleFitStatus] = useState<GoogleFitStatusResponse | null>(null)
  const [syncingGoogle, setSyncingGoogle] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [activityData, questsData, jarData, googleStatus] = await Promise.all([
        getTodayActivity(),
        getDailyQuests(),
        getJarSummary(),
        getGoogleFitStatus(),
        refreshCharacter(),
      ])
      setActivity(activityData)
      setQuests(questsData)
      setJar(jarData)
      setGoogleFitStatus(googleStatus)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    } finally {
      setLoading(false)
    }
  }, [refreshCharacter])

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

  // Handle OAuth return from Google — clear the query param so it doesn't persist on refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const googlefit = params.get('googlefit')
    if (googlefit) {
      window.history.replaceState({}, '', window.location.pathname)
      if (googlefit === 'connected') loadData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGoogleConnect() {
    try {
      const { authUrl } = await getGoogleFitAuthUrl()
      window.location.href = authUrl
    } catch {
      console.error('Failed to get Google Fit auth URL')
    }
  }

  async function handleGoogleSync() {
    setSyncingGoogle(true)
    try {
      await triggerGoogleFitSync()
      await loadData()
    } catch {
      console.error('Google Fit sync failed')
    } finally {
      setSyncingGoogle(false)
    }
  }

  async function handleGoogleDisconnect() {
    try {
      await disconnectGoogleFit()
      await loadData()
    } catch {
      console.error('Failed to disconnect Google Fit')
    }
  }

  if (loading) {
    return (
      <div className="text-[var(--color-text-muted)] italic pt-8">
        The realm is loading...
      </div>
    )
  }

  const weekPercent = jar ? Math.round(jar.currentWeekUnlockedPercent * 100) : 0
  const stepsToday = activity?.stepsToday ?? 0
  const agilityLevel = character?.skills.find(s => s.skillType === SkillType.Agility)?.level ?? 1
  const stepGoal = getStepGoal(agilityLevel)
  const existingStepCount = stepsToday > 0 ? stepsToday : null

  return (
    <div className="flex flex-col gap-6">

      {/* Welcome header */}
      <div>
        <h1 className="text-[1.75rem] mb-1">{character?.name}</h1>
        <p className="text-[var(--color-text-muted)] italic">
          Total Level {character?.totalLevel} — {getGreeting()}
        </p>
      </div>

      {/* Step count card */}
      <div className="card">
        <SectionHeader title="Today's Steps" />
        <div className="p-3 flex flex-col gap-3">
          <div className="flex justify-between items-baseline gap-4">
            <span className="font-display text-[1.1rem] text-[var(--color-text)]">
              {stepsToday > 0 ? `${stepsToday.toLocaleString()} steps` : 'No steps logged today'}
            </span>
            <span className="text-[var(--color-text-muted)] text-sm shrink-0">
              Goal: {stepGoal.toLocaleString()}
            </span>
          </div>
          <div className="h-[6px] bg-[var(--color-border)] rounded-[3px] overflow-hidden">
            <div
              className="h-full transition-[width] duration-300"
              style={{
                width: `${Math.min(100, stepsToday > 0 ? (stepsToday / stepGoal) * 100 : 0)}%`,
                background: 'linear-gradient(90deg, var(--color-gold-dim), var(--color-gold))',
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Google Fit section */}
            {googleFitStatus?.isConnected ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGoogleSync}
                  disabled={syncingGoogle}
                  className="font-display text-xs tracking-widest uppercase min-h-11 px-4 border rounded-xs cursor-pointer transition-all duration-150 border-(--color-border-bright) bg-transparent text-(--color-text-muted) hover:border-(--color-gold-dim) hover:text-(--color-text) disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncingGoogle ? 'Syncing...' : 'Sync Now'}
                </button>
                <div className="flex flex-col">
                  <span className="text-[0.75rem] text-(--color-text-faint)">
                    Google Fit connected
                  </span>
                  {googleFitStatus.lastSyncedAt && (
                    <span className="text-[0.7rem] text-(--color-text-faint)">
                      Last synced {formatRelativeTime(googleFitStatus.lastSyncedAt)}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleGoogleDisconnect}
                  className="text-[0.75rem] text-(--color-text-faint) bg-transparent border-none cursor-pointer hover:text-(--color-text-muted) transition-colors duration-150 ml-1"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleConnect}
                className="font-display text-xs tracking-widest uppercase min-h-11 px-4 border rounded-xs cursor-pointer transition-all duration-150 border-(--color-border-bright) bg-transparent text-(--color-text-muted) hover:border-(--color-gold-dim) hover:text-(--color-text)"
              >
                Connect Google Fit
              </button>
            )}

            {/* Manual entry button */}
            <button
              onClick={() => setShowStepsModal(true)}
              className="font-display text-xs tracking-widest uppercase min-h-11 px-4 border rounded-xs cursor-pointer transition-all duration-150 border-(--color-border-bright) bg-transparent text-(--color-text-muted) hover:border-(--color-gold-dim) hover:text-(--color-text)"
            >
              {existingStepCount !== null ? 'Update Steps' : 'Log Steps'}
            </button>
          </div>
        </div>
      </div>

      {/* Top row: quests + right column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Daily quests */}
        <div className="card">
          <SectionHeader title="Daily Quests" />
          {quests?.quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-3 border-b border-[var(--color-border)] ${quest.status === 'Completed' ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between mb-[0.4rem]">
                <span className={`font-display text-xs tracking-[0.1em] uppercase ${
                  quest.status === 'Completed'
                    ? 'text-[var(--color-green-bright)]'
                    : 'text-[var(--color-gold-dim)]'
                }`}>
                  {quest.skillTarget}
                  {quest.status === 'Completed' && ' — Complete'}
                </span>
                <span className="text-[var(--color-text-muted)] text-sm">
                  {quest.currentValue}/{quest.targetValue}
                </span>
              </div>
              <p className="text-[var(--color-text)] text-[0.95rem] leading-[1.5]">
                {quest.description}
              </p>
              <div className="mt-2 h-[3px] bg-[var(--color-border)] rounded-[2px] overflow-hidden">
                <div
                  className={`h-full transition-[width] duration-300 ${
                    quest.status === 'Completed'
                      ? 'bg-[var(--color-green-bright)]'
                      : 'bg-[var(--color-gold)]'
                  }`}
                  style={{ width: `${Math.min(100, (quest.currentValue / quest.targetValue) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {quests?.allCompleted && (
            <p className="p-3 text-[var(--color-green-bright)] italic text-[0.9rem] text-center">
              All quests complete. Well done, adventurer.
            </p>
          )}
        </div>

        {/* Right column: hydration + reward jar */}
        <div className="flex flex-col gap-6">

          {/* Water tracker */}
          <div className="card">
            <SectionHeader title="Hydration" />
            <div className="p-3">
              <p className="text-[var(--color-text-muted)] text-sm mb-3">
                {activity?.waterGlassesToday ?? 0} of 8 glasses today
              </p>
              <div className="flex gap-2">
                {Array.from({ length: 8 }).map((_, i) => {
                  const filled = i < (activity?.waterGlassesToday ?? 0)
                  return (
                    <button
                      key={i}
                      onClick={() => handleWaterTap(i)}
                      title={filled ? 'Remove last glass' : 'Log a glass'}
                      className={`flex-1 h-9 rounded-[2px] border cursor-pointer text-lg transition-all duration-150 flex items-center justify-center ${
                        filled
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                          : 'border-[var(--color-border-bright)] bg-transparent hover:border-[var(--color-gold-dim)]'
                      }`}
                    >
                      {filled ? '💧' : '○'}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reward jar */}
          <div className="card">
            <SectionHeader title="Reward Jar" />
            <div className="p-3">
              <div className="flex justify-between mb-2">
                <span className="text-[var(--color-text-muted)] text-sm">Total unlocked</span>
                <span className="font-display text-[var(--color-gold)] text-[1.1rem]">
                  ${jar?.totalUnlockedBalance.toFixed(2) ?? '0.00'}
                </span>
              </div>
              <div className="mb-[0.4rem]">
                <div className="flex justify-between mb-[0.3rem]">
                  <span className="text-[var(--color-text-muted)] text-sm">This week</span>
                  <span className="text-[var(--color-text-muted)] text-sm">
                    {weekPercent}% — ${jar?.currentWeekUnlockedAmount.toFixed(2) ?? '0.00'} of ${jar?.currentWeekMaxEarn.toFixed(2) ?? '50.00'}
                  </span>
                </div>
                <div className="h-[6px] bg-[var(--color-border)] rounded-[3px] overflow-hidden">
                  <div
                    className="h-full transition-[width] duration-300"
                    style={{
                      width: `${weekPercent}%`,
                      background: 'linear-gradient(90deg, var(--color-gold-dim), var(--color-gold))',
                    }}
                  />
                </div>
              </div>
              <p className="text-[var(--color-text-faint)] text-sm italic">
                {jar?.dailyQuestDaysCompletedThisWeek ?? 0}/7 quest days this week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="card">
        <SectionHeader title="Log Activity" />
        <div className="p-3 flex flex-col md:flex-row gap-3">
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
      <div className="card">
        <SectionHeader title="Today" />
        <div className="p-3 grid grid-cols-3 gap-4">
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
      {showStepsModal && (
        <LogStepsModal
          onClose={() => setShowStepsModal(false)}
          onSuccess={() => { setShowStepsModal(false); loadData() }}
          existingStepCount={existingStepCount}
        />
      )}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-3 py-[0.6rem] border-b border-[var(--color-border)] flex items-center gap-2">
      <div className="w-[3px] h-[14px] bg-[var(--color-gold)] rounded-[1px] shrink-0" />
      <span className="font-display text-xs tracking-[0.12em] uppercase text-[var(--color-text-muted)] font-semibold">
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
      className={`font-display text-xs tracking-[0.1em] uppercase min-h-[44px] px-4 w-full md:w-auto border rounded-[2px] cursor-pointer transition-all duration-150 ${
        done
          ? 'border-[var(--color-green-bright)] bg-[rgba(42,92,42,0.3)] text-[var(--color-green-bright)]'
          : 'border-[var(--color-border-bright)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-gold-dim)] hover:text-[var(--color-text)]'
      }`}
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
      <p className="font-display text-[0.75rem] tracking-[0.1em] uppercase text-[var(--color-text-faint)] mb-1">
        {label}
      </p>
      <p className={`text-[1.25rem] font-display ${highlight ? 'text-[var(--color-green-bright)]' : 'text-[var(--color-text)]'}`}>
        {value}
      </p>
    </div>
  )
}

function getStepGoal(agilityLevel: number): number {
  if (agilityLevel >= 61) return STEP_GOALS.LEVEL_61
  if (agilityLevel >= 41) return STEP_GOALS.LEVEL_41
  if (agilityLevel >= 21) return STEP_GOALS.LEVEL_21
  return STEP_GOALS.LEVEL_1
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'The morning road awaits.'
  if (hour < 17) return 'The afternoon stretches ahead.'
  return 'The evening watch begins.'
}
