import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { getEventLog } from '../api/character'
import { colors } from '../theme'

const SKILL_COLORS: Record<string, string> = {
  Agility: '#4a9c4a',
  Endurance: '#c43030',
  Vitality: '#4a7ac4',
  Discipline: '#c9a84c',
  Nutrition: '#9c4a9c',
  Hydration: '#4ac4c4',
}

const SKILL_DESCRIPTIONS: Record<string, { role: string; trains: string }> = {
  Agility: { role: 'Accuracy — determines whether attacks land', trains: 'Daily steps via Health Connect' },
  Endurance: { role: 'Power — determines damage when attacks land', trains: 'Logged workouts' },
  Vitality: { role: 'Defence — reduces incoming boss damage', trains: 'Weight and measurement logs' },
  Discipline: { role: 'Hitpoints — your HP pool in boss fights', trains: 'Daily check-ins and quest completions' },
  Nutrition: { role: 'Fury — chance to deal 1 bonus damage per round', trains: 'Meal check-ins' },
  Hydration: { role: 'Resilience — chance to negate 1 incoming damage per round', trains: 'Logging glasses of water' },
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

export default function CharacterScreen() {
  const { character } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getEventLog(1, 30)
        setEvents(data)
        setHasMore(data.length === 30)
      } catch (err) {
        console.error('Failed to load events', err)
      } finally {
        setLoadingEvents(false)
      }
    }
    load()
  }, [])

  async function loadMore() {
    const nextPage = page + 1
    try {
      const data = await getEventLog(nextPage, 30)
      setEvents((prev) => [...prev, ...data])
      setPage(nextPage)
      setHasMore(data.length === 30)
    } catch (err) {
      console.error('Failed to load more events', err)
    }
  }

  if (!character) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Character header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.title}>
              {character.titleEquipped ?? 'Adventurer'}
            </Text>
          </View>
          <View style={styles.totalLevelBox}>
            <Text style={styles.totalLevelLabel}>Total Level</Text>
            <Text style={styles.totalLevel}>{character.totalLevel}</Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <SectionHeader title="Skills" />
          {character.skills.map((skill: any) => {
            const color = SKILL_COLORS[skill.skillType] ?? colors.gold
            const desc = SKILL_DESCRIPTIONS[skill.skillType]
            const isExpanded = expandedSkill === skill.skillType
            const xpInto = skill.xpIntoCurrentLevel
            const xpTotal = xpInto + skill.xpToNextLevel
            const progressPercent = skill.xpToNextLevel === 0
              ? 100
              : Math.round((xpInto / xpTotal) * 100)

            return (
              <TouchableOpacity
                key={skill.skillType}
                onPress={() => setExpandedSkill(isExpanded ? null : skill.skillType)}
                style={styles.skillRow}
                activeOpacity={0.7}
              >
                <View style={styles.skillMain}>
                  <View style={[styles.skillDot, { backgroundColor: color }]} />
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.skillType}</Text>
                    <Text style={styles.skillLevel}>Level {skill.level}</Text>
                  </View>
                  <View style={styles.skillRight}>
                    <View style={styles.progressBarBg}>
                      <View style={[
                        styles.progressBarFill,
                        { width: `${progressPercent}%`, backgroundColor: color },
                      ]} />
                    </View>
                    <Text style={styles.xpText}>
                      {xpInto.toLocaleString()} / {skill.level < 99 ? xpTotal.toLocaleString() : 'MAX'}
                    </Text>
                  </View>
                </View>

                {isExpanded && desc && (
                  <View style={styles.skillExpanded}>
                    <View style={styles.skillExpandedSection}>
                      <Text style={styles.expandedLabel}>Combat Role</Text>
                      <Text style={styles.expandedText}>{desc.role}</Text>
                    </View>
                    <View style={styles.skillExpandedSection}>
                      <Text style={styles.expandedLabel}>How to Train</Text>
                      <Text style={styles.expandedText}>{desc.trains}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Event log */}
        <View style={styles.card}>
          <SectionHeader title="Event Log" />
          {loadingEvents ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.gold} size="small" />
            </View>
          ) : events.length === 0 ? (
            <Text style={styles.emptyText}>
              No events yet. Start logging activity to see your history here.
            </Text>
          ) : (
            <>
              {events.map((event) => {
                const color = SKILL_COLORS[event.skillType] ?? colors.textMuted
                const isNegative = event.xpAmount < 0
                return (
                  <View key={event.id} style={styles.eventRow}>
                    <View style={[styles.eventDot, { backgroundColor: color }]} />
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventSkill}>{event.skillType}</Text>
                      <Text style={styles.eventSource}>
                        {SOURCE_LABELS[event.source] ?? event.source}
                      </Text>
                    </View>
                    <View style={styles.eventRight}>
                      <Text style={[
                        styles.eventXp,
                        { color: isNegative ? colors.redBright : colors.gold },
                      ]}>
                        {isNegative ? '' : '+'}{event.xpAmount}
                      </Text>
                      <Text style={styles.eventTime}>
                        {formatDateTime(event.awardedAt)}
                      </Text>
                    </View>
                  </View>
                )
              })}
              {hasMore && (
                <TouchableOpacity
                  onPress={loadMore}
                  style={styles.loadMoreButton}
                >
                  <Text style={styles.loadMoreText}>Load More</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  centered: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  characterName: {
    fontSize: 28,
    color: colors.gold,
    letterSpacing: 2,
  },
  title: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 14,
    marginTop: 2,
  },
  totalLevelBox: {
    alignItems: 'flex-end',
  },
  totalLevelLabel: {
    color: colors.textFaint,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  totalLevel: {
    color: colors.gold,
    fontSize: 40,
    letterSpacing: 2,
    lineHeight: 44,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: colors.gold,
    borderRadius: 1,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  skillRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 12,
  },
  skillMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skillInfo: {
    width: 90,
  },
  skillName: {
    color: colors.text,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  skillLevel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  skillRight: {
    flex: 1,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  xpText: {
    color: colors.textFaint,
    fontSize: 11,
  },
  skillExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: 16,
  },
  skillExpandedSection: {
    flex: 1,
  },
  expandedLabel: {
    color: colors.textFaint,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  expandedText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    padding: 16,
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 13,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventInfo: {
    flex: 1,
  },
  eventSkill: {
    color: colors.text,
    fontSize: 13,
  },
  eventSource: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  eventRight: {
    alignItems: 'flex-end',
  },
  eventXp: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  eventTime: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 1,
  },
  loadMoreButton: {
    padding: 14,
    alignItems: 'center',
  },
  loadMoreText: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})