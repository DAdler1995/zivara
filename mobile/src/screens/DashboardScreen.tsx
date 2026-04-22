import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import {
  getTodayActivity,
  checkIn,
  logWater,
  removeLastWater,
} from '../api/activity'
import { getDailyQuests } from '../api/quests'
import { getJarSummary } from '../api/rewards'
import { colors } from '../theme'
import LogMealModal from '../components/LogMealModal'
import LogWorkoutModal from '../components/LogWorkoutModal'
import LogWeightModal from '../components/LogWeightModal'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DashboardScreen() {
  const { character } = useAuth()
  const [activity, setActivity] = useState<any>(null)
  const [quests, setQuests] = useState<any>(null)
  const [jar, setJar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showMeal, setShowMeal] = useState(false)
  const [showWorkout, setShowWorkout] = useState(false)
  const [showWeight, setShowWeight] = useState(false)

  async function loadData() {
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
      console.error('Failed to load dashboard', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
  }

  async function handleCheckIn() {
    try {
      await checkIn()
      await loadData()
    } catch {
      // already checked in
    }
  }

async function handleWaterTap(index: number) {
  if (!activity) return
  const filled = index < activity.waterGlassesToday
  try {
    if (filled) {
      await removeLastWater()
    } else {
      await logWater(1)
    }
    await loadData()
  } catch (err) {
    console.error('Water tap failed', err)
  }
}

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
        <Text style={styles.loadingText}>The realm is loading...</Text>
      </View>
    )
  }

  const weekPercent = jar ? Math.round(jar.currentWeekUnlockedPercent * 100) : 0

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.characterName}>{character?.name}</Text>
          <Text style={styles.totalLevel}>Total Level {character?.totalLevel}</Text>
          <Text style={styles.greeting}>{getGreeting()}</Text>
        </View>

        {/* Daily Quests */}
        <View style={styles.card}>
          <SectionHeader title="Daily Quests" />
          {quests?.quests.map((quest: any) => (
            <View
              key={quest.id}
              style={[styles.questRow, quest.status === 'Completed' && styles.questComplete]}
            >
              <View style={styles.questHeader}>
                <Text style={[
                  styles.questSkill,
                  quest.status === 'Completed' && styles.questSkillComplete,
                ]}>
                  {quest.skillTarget}
                  {quest.status === 'Completed' ? ' — Complete' : ''}
                </Text>
                <Text style={styles.questProgress}>
                  {quest.currentValue}/{quest.targetValue}
                </Text>
              </View>
              <Text style={styles.questDescription}>{quest.description}</Text>
              <View style={styles.progressBarBg}>
                <View style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, (quest.currentValue / quest.targetValue) * 100)}%`,
                    backgroundColor: quest.status === 'Completed'
                      ? colors.greenBright
                      : colors.gold,
                  }
                ]} />
              </View>
            </View>
          ))}
          {quests?.allCompleted && (
            <Text style={styles.allComplete}>
              All quests complete. Well done, adventurer.
            </Text>
          )}
        </View>

        {/* Water Tracker */}
        <View style={styles.card}>
          <SectionHeader title="Hydration" />
          <View style={styles.cardBody}>
            <Text style={styles.waterCount}>
              {activity?.waterGlassesToday ?? 0} of 8 glasses today
            </Text>
            <View style={styles.waterRow}>
              {Array.from({ length: 8 }).map((_, i) => {
                const filled = i < (activity?.waterGlassesToday ?? 0)
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleWaterTap(i)}
                    style={[
                      styles.waterGlass,
                      filled && styles.waterGlassFilled,
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {filled ? '💧' : '○'}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </View>

        {/* Reward Jar */}
        <View style={styles.card}>
          <SectionHeader title="Reward Jar" />
          <View style={styles.cardBody}>
            <View style={styles.jarRow}>
              <Text style={styles.jarLabel}>Total Unlocked</Text>
              <Text style={styles.jarBalance}>
                ${jar?.totalUnlockedBalance.toFixed(2) ?? '0.00'}
              </Text>
            </View>
            <View style={styles.jarRow}>
              <Text style={styles.jarSubLabel}>This week</Text>
              <Text style={styles.jarSubValue}>
                {weekPercent}% — ${jar?.currentWeekUnlockedAmount.toFixed(2) ?? '0.00'}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill,
                {
                  width: `${weekPercent}%`,
                  backgroundColor: colors.gold,
                }
              ]} />
            </View>
            <Text style={styles.jarQuestDays}>
              {jar?.dailyQuestDaysCompletedThisWeek ?? 0}/7 quest days this week
            </Text>
          </View>
        </View>

        {/* Log Activity */}
        <View style={styles.card}>
          <SectionHeader title="Log Activity" />
          <View style={styles.actionGrid}>
            <ActionButton
              label="Check In"
              done={activity?.checkedInToday}
              onPress={handleCheckIn}
            />
            <ActionButton
              label="Log Meal"
              onPress={() => setShowMeal(true)}
            />
            <ActionButton
              label="Log Workout"
              onPress={() => setShowWorkout(true)}
            />
            <ActionButton
              label="Log Weight"
              onPress={() => setShowWeight(true)}
            />
          </View>
        </View>

        {/* Today Summary */}
        <View style={styles.card}>
          <SectionHeader title="Today" />
          <View style={styles.statGrid}>
            <StatBox label="Steps" value={activity?.stepsToday.toLocaleString() ?? '0'} />
            <StatBox label="Meals" value={String(activity?.mealsLoggedToday ?? 0)} />
            <StatBox
              label="Check-in"
              value={activity?.checkedInToday ? 'Done' : 'Pending'}
              highlight={activity?.checkedInToday}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals stay outside ScrollView but inside SafeAreaView */}
      <Modal visible={showMeal} transparent animationType="slide">
        <LogMealModal
          onClose={() => setShowMeal(false)}
          onSuccess={() => { setShowMeal(false); loadData() }}
        />
      </Modal>
      <Modal visible={showWorkout} transparent animationType="slide">
        <LogWorkoutModal
          onClose={() => setShowWorkout(false)}
          onSuccess={() => { setShowWorkout(false); loadData() }}
        />
      </Modal>
      <Modal visible={showWeight} transparent animationType="slide">
        <LogWeightModal
          onClose={() => setShowWeight(false)}
          onSuccess={() => { setShowWeight(false); loadData() }}
        />
      </Modal>
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

function ActionButton({ label, done, onPress }: { label: string; done?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.actionButton, done && styles.actionButtonDone]}
    >
      <Text style={[styles.actionButtonText, done && styles.actionButtonTextDone]}>
        {done ? `✓ ${label}` : label}
      </Text>
    </TouchableOpacity>
  )
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
    </View>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'The morning road awaits.'
  if (hour < 17) return 'The afternoon stretches ahead.'
  return 'The evening watch begins.'
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
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  header: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  characterName: {
    fontSize: 28,
    color: colors.gold,
    letterSpacing: 2,
  },
  totalLevel: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  greeting: {
    color: colors.textFaint,
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardBody: {
    padding: 12,
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
  questRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  questComplete: {
    opacity: 0.5,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  questSkill: {
    color: colors.goldDim,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  questSkillComplete: {
    color: colors.greenBright,
  },
  questProgress: {
    color: colors.textMuted,
    fontSize: 12,
  },
  questDescription: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  allComplete: {
    padding: 12,
    color: colors.greenBright,
    fontStyle: 'italic',
    fontSize: 13,
    textAlign: 'center',
  },
  waterCount: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 10,
  },
  waterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  waterGlass: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterGlassFilled: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  jarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  jarLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  jarBalance: {
    color: colors.gold,
    fontSize: 22,
    letterSpacing: 1,
  },
  jarSubLabel: {
    color: colors.textFaint,
    fontSize: 12,
  },
  jarSubValue: {
    color: colors.textMuted,
    fontSize: 12,
  },
  jarQuestDays: {
    color: colors.textFaint,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  actionGrid: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 2,
  },
  actionButtonDone: {
    borderColor: colors.greenBright,
    backgroundColor: 'rgba(42,92,42,0.3)',
  },
  actionButtonText: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionButtonTextDone: {
    color: colors.greenBright,
  },
  statGrid: {
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    color: colors.textFaint,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    letterSpacing: 1,
  },
  statValueHighlight: {
    color: colors.greenBright,
  },
})