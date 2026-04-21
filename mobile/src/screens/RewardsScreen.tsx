import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getJarSummary, getWishList, createWishListItem, deleteWishListItem } from '../api/rewards'
import { colors } from '../theme'

export default function RewardsScreen() {
  const [jar, setJar] = useState<any>(null)
  const [wishList, setWishList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newCost, setNewCost] = useState('')
  const [newTrigger, setNewTrigger] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [jarData, wishListData] = await Promise.all([
          getJarSummary(),
          getWishList(),
        ])
        setJar(jarData)
        setWishList(wishListData)
      } catch (err) {
        console.error('Failed to load rewards', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleAddItem() {
    if (!newLabel.trim()) return
    setAdding(true)
    try {
      const item = await createWishListItem(
        newLabel.trim(),
        newCost ? parseFloat(newCost) : undefined,
        newTrigger.trim() || undefined
      )
      setWishList((prev) => [...prev, item])
      setNewLabel('')
      setNewCost('')
      setNewTrigger('')
      setShowAddForm(false)
    } catch (err) {
      console.error('Failed to add item', err)
    } finally {
      setAdding(false)
    }
  }

  function confirmDelete(id: string, label: string) {
    Alert.alert(
      'Remove Item',
      `Remove "${label}" from your wish list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWishListItem(id)
              setWishList((prev) => prev.filter((item) => item.id !== id))
            } catch (err) {
              console.error('Failed to delete item', err)
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    )
  }

  const weekPercent = jar ? Math.round(jar.currentWeekUnlockedPercent * 100) : 0

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.pageTitle}>Rewards</Text>

        {/* Jar summary */}
        <View style={styles.card}>
          <SectionHeader title="Reward Jar" />
          <View style={styles.cardBody}>

            {/* Balance */}
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>Total Unlocked</Text>
                <Text style={styles.balanceAmount}>
                  ${jar?.totalUnlockedBalance.toFixed(2) ?? '0.00'}
                </Text>
              </View>
              <View style={styles.weeklyMaxBox}>
                <Text style={styles.balanceLabel}>Weekly Max</Text>
                <Text style={styles.weeklyMaxAmount}>
                  ${jar?.currentWeekMaxEarn.toFixed(2) ?? '50.00'}
                </Text>
              </View>
            </View>

            {/* Week progress */}
            <View style={styles.weekRow}>
              <Text style={styles.weekLabel}>This Week</Text>
              <Text style={styles.weekValue}>
                {weekPercent}% — ${jar?.currentWeekUnlockedAmount.toFixed(2) ?? '0.00'}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill,
                { width: `${weekPercent}%` },
              ]} />
            </View>

            {/* Weekly breakdown */}
            <View style={styles.statsRow}>
              <WeekStat
                label="Quest Days"
                value={`${jar?.dailyQuestDaysCompletedThisWeek ?? 0}/7`}
                detail="+10% each"
                achieved={(jar?.dailyQuestDaysCompletedThisWeek ?? 0) > 0}
              />
              <WeekStat
                label="Weekly Quest"
                value={jar?.weeklyQuestCompleted ? 'Done' : 'Pending'}
                detail="+20%"
                achieved={jar?.weeklyQuestCompleted ?? false}
              />
              <WeekStat
                label="World Boss"
                value={jar?.worldBossKilledThisWeek ? 'Slain' : 'Alive'}
                detail="+10%"
                achieved={jar?.worldBossKilledThisWeek ?? false}
              />
            </View>
          </View>
        </View>

        {/* Wish list */}
        <View style={styles.card}>
          <View style={styles.wishListHeader}>
            <View style={styles.sectionHeaderInner}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Wish List</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAddForm((v) => !v)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>
                {showAddForm ? 'Cancel' : '+ Add'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add form */}
          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={styles.fieldLabel}>Item</Text>
              <TextInput
                style={styles.textInput}
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="e.g. New gaming headset"
                placeholderTextColor={colors.textFaint}
              />
              <View style={styles.addFormRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Est. Cost ($)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCost}
                    onChangeText={setNewCost}
                    placeholder="150"
                    placeholderTextColor={colors.textFaint}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <Text style={styles.fieldLabel}>Milestone Trigger (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={newTrigger}
                onChangeText={setNewTrigger}
                placeholder="e.g. TotalLevel150"
                placeholderTextColor={colors.textFaint}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!newLabel.trim() || adding) && styles.submitButtonDisabled,
                ]}
                onPress={handleAddItem}
                disabled={!newLabel.trim() || adding}
              >
                <Text style={styles.submitButtonText}>
                  {adding ? 'Adding...' : 'Add Item'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Items */}
          {wishList.length === 0 ? (
            <Text style={styles.emptyText}>
              No items yet. Add something to work toward.
            </Text>
          ) : (
            wishList.map((item) => (
              <View
                key={item.id}
                style={[styles.wishItem, item.isUnlocked && styles.wishItemUnlocked]}
              >
                <Text style={styles.wishItemIcon}>
                  {item.isUnlocked ? '✓' : '○'}
                </Text>
                <View style={styles.wishItemInfo}>
                  <Text style={[
                    styles.wishItemLabel,
                    item.isUnlocked && styles.wishItemLabelUnlocked,
                  ]}>
                    {item.label}
                  </Text>
                  {item.milestoneTrigger && (
                    <Text style={styles.wishItemTrigger}>
                      Unlocks on: {item.milestoneTrigger}
                    </Text>
                  )}
                </View>
                <View style={styles.wishItemRight}>
                  {item.estimatedCost && (
                    <Text style={styles.wishItemCost}>
                      ${item.estimatedCost.toFixed(2)}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => confirmDelete(item.id, item.label)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
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

function WeekStat({
  label,
  value,
  detail,
  achieved,
}: {
  label: string
  value: string
  detail: string
  achieved: boolean
}) {
  return (
    <View style={[styles.weekStat, achieved && styles.weekStatAchieved]}>
      <Text style={styles.weekStatLabel}>{label}</Text>
      <Text style={[styles.weekStatValue, achieved && styles.weekStatValueAchieved]}>
        {value}
      </Text>
      <Text style={styles.weekStatDetail}>{detail}</Text>
    </View>
  )
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
  },
  pageTitle: {
    fontSize: 28,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: 4,
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
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  sectionHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
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
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  balanceAmount: {
    color: colors.gold,
    fontSize: 36,
    letterSpacing: 1,
    lineHeight: 40,
  },
  weeklyMaxBox: {
    alignItems: 'flex-end',
  },
  weeklyMaxAmount: {
    color: colors.textMuted,
    fontSize: 24,
    letterSpacing: 1,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekLabel: {
    color: colors.textFaint,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  weekValue: {
    color: colors.textMuted,
    fontSize: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  weekStat: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
  },
  weekStatAchieved: {
    borderColor: colors.greenBright,
  },
  weekStatLabel: {
    color: colors.textFaint,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  weekStatValue: {
    color: colors.text,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  weekStatValueAchieved: {
    color: colors.greenBright,
  },
  weekStatDetail: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 2,
  },
  wishListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 2,
  },
  addButtonText: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  addForm: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    gap: 8,
  },
  addFormRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldLabel: {
    color: colors.textFaint,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 2,
    color: colors.text,
    padding: 10,
    fontSize: 15,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: colors.gold,
    borderRadius: 2,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.bg,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  emptyText: {
    padding: 16,
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 13,
  },
  wishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  wishItemUnlocked: {
    opacity: 0.5,
  },
  wishItemIcon: {
    color: colors.textFaint,
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  wishItemInfo: {
    flex: 1,
  },
  wishItemLabel: {
    color: colors.text,
    fontSize: 14,
  },
  wishItemLabelUnlocked: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  wishItemTrigger: {
    color: colors.textFaint,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  wishItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  wishItemCost: {
    color: colors.goldDim,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    color: colors.textFaint,
    fontSize: 20,
    lineHeight: 20,
  },
})