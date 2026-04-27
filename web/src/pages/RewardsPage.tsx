import { useState, useEffect } from 'react'
import { getJarSummary, getWishList, createWishListItem, deleteWishListItem } from '../api/rewards'
import type { JarSummaryResponse, WishListItemDto } from '../api/rewards'
import { usePageTitle } from '../context/usePageTitle'

export default function RewardsPage() {
  usePageTitle('Rewards')
  const [jar, setJar] = useState<JarSummaryResponse | null>(null)
  const [wishList, setWishList] = useState<WishListItemDto[]>([])
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
      console.error('Failed to add wish list item', err)
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteWishListItem(id)
      setWishList((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error('Failed to delete wish list item', err)
    }
  }

  if (loading) {
    return (
      <div className="text-(--color-text-muted) italic pt-8">Loading rewards...</div>
    )
  }

  const weekPercent = jar ? Math.round(jar.currentWeekUnlockedPercent * 100) : 0

  return (
    <div className="flex flex-col gap-6">

      <h1 className="text-[1.75rem]">Rewards</h1>

      {/* Jar summary */}
      <div className="card">
        <SectionHeader title="Reward Jar" />
        <div className="p-5 flex flex-col gap-5">

          {/* Total balance */}
          <div className="flex items-center justify-between p-4 bg-(--color-surface-raised) border border-(--color-border) rounded-xs">
            <div>
              <p className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint) mb-1">
                Total Unlocked
              </p>
              <p className="font-display text-[2.5rem] text-(--color-gold) leading-none">
                ${jar?.totalUnlockedBalance.toFixed(2) ?? '0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint) mb-1">
                Weekly Max
              </p>
              <p className="font-display text-[1.5rem] text-(--color-text-muted) leading-none">
                ${jar?.currentWeekMaxEarn.toFixed(2) ?? '50.00'}
              </p>
            </div>
          </div>

          {/* This week progress */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint)">
                This Week
              </span>
              <span className="font-display text-[0.75rem] text-(--color-gold)">
                {weekPercent}% — ${jar?.currentWeekUnlockedAmount.toFixed(2) ?? '0.00'}
              </span>
            </div>
            <div className="h-2 bg-(--color-border) rounded-[4px] overflow-hidden">
              <div
                className="h-full rounded-[4px] transition-[width] duration-300"
                style={{
                  width: `${weekPercent}%`,
                  background: 'linear-gradient(90deg, var(--color-gold-dim), var(--color-gold))',
                }}
              />
            </div>
          </div>

          {/* Weekly breakdown */}
          <div className="grid grid-cols-3 gap-3">
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
          </div>
        </div>
      </div>

      {/* Wish list */}
      <div className="card">
        {/* Wish list header */}
        <div className="px-3 py-[0.6rem] border-b border-(--color-border) flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-[3px] h-[14px] bg-(--color-gold) rounded-[1px] shrink-0" />
            <span className="font-display text-[0.75rem] tracking-[0.12em] uppercase text-(--color-text-muted) font-semibold">
              Wish List
            </span>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="bg-transparent border border-(--color-border-bright) rounded-xs text-(--color-text-muted) px-[0.6rem] py-1 cursor-pointer font-display text-[0.75rem] tracking-widest uppercase transition-all duration-150 hover:border-(--color-gold-dim) hover:text-(--color-text)"
          >
            {showAddForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="px-5 py-4 border-b border-(--color-border) bg-(--color-surface-raised) flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end">
              <div>
                <FieldLabel text="Item" />
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. New gaming headset"
                  className="w-full bg-(--color-surface) border border-(--color-border-bright) rounded-xs text-(--color-text) px-3 py-[0.55rem] text-[0.95rem] font-body outline-none"
                />
              </div>
              <div>
                <FieldLabel text="Est. Cost ($)" />
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  placeholder="150"
                  className="w-full md:w-[100px] bg-(--color-surface) border border-(--color-border-bright) rounded-xs text-(--color-text) px-3 py-[0.55rem] text-[0.95rem] font-body outline-none"
                />
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newLabel.trim() || adding}
                className="min-h-[38px] px-4 border border-(--color-gold) rounded-xs bg-(--color-gold) text-(--color-bg) cursor-pointer font-display text-[0.75rem] tracking-widest uppercase transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? '...' : 'Add'}
              </button>
            </div>
            <div>
              <FieldLabel text="Milestone Trigger (optional)" />
              <input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="e.g. TotalLevel150"
                className="w-full bg-(--color-surface) border border-(--color-border-bright) rounded-xs text-(--color-text) px-3 py-[0.55rem] text-[0.95rem] font-body outline-none"
              />
            </div>
          </div>
        )}

        {/* Wish list items */}
        {wishList.length === 0 ? (
          <p className="p-4 text-(--color-text-muted) italic text-[0.9rem]">
            No items yet. Add something to work toward.
          </p>
        ) : (
          wishList.map((item) => (
            <div
              key={item.id}
              className={`px-4 py-3 border-b border-(--color-border) flex items-center justify-between ${item.isUnlocked ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-base ${item.isUnlocked ? 'text-(--color-green-bright)' : 'text-(--color-text-faint)'}`}>
                  {item.isUnlocked ? '✓' : '○'}
                </span>
                <div>
                  <p className={`text-[0.95rem] ${item.isUnlocked ? 'text-(--color-text-muted) line-through' : 'text-(--color-text)'}`}>
                    {item.label}
                  </p>
                  {item.milestoneTrigger && (
                    <p className="text-[0.75rem] text-(--color-text-faint) italic">
                      Unlocks on: {item.milestoneTrigger}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {item.estimatedCost && (
                  <span className="font-display text-[0.9rem] text-(--color-gold-dim)">
                    ${item.estimatedCost.toFixed(2)}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-transparent border-none text-(--color-text-faint) cursor-pointer text-base leading-none p-1 transition-colors duration-150 hover:text-(--color-red-bright)"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            </div>
          ))
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
    <div className={`p-3 bg-(--color-surface-raised) rounded-xs border ${achieved ? 'border-(--color-green-bright)' : 'border-(--color-border)'}`}>
      <p className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint) mb-[0.3rem]">
        {label}
      </p>
      <p className={`font-display text-base ${achieved ? 'text-(--color-green-bright)' : 'text-(--color-text)'}`}>
        {value}
      </p>
      <p className="text-[0.75rem] text-(--color-text-faint) mt-[0.15rem]">{detail}</p>
    </div>
  )
}

function FieldLabel({ text }: { text: string }) {
  return (
    <span className="block font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint) mb-[0.3rem]">
      {text}
    </span>
  )
}
