import { useState, useEffect } from 'react'
import { getJarSummary, getWishList, createWishListItem, deleteWishListItem } from '../api/rewards'
import type { JarSummaryResponse, WishListItemDto } from '../api/rewards'

export default function RewardsPage() {
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
      <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        Loading rewards...
      </div>
    )
  }

  const weekPercent = jar ? Math.round(jar.currentWeekUnlockedPercent * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <h1 style={{ fontSize: '1.75rem' }}>Rewards</h1>

      {/* Jar summary */}
      <div style={cardStyle}>
        <SectionHeader title="Reward Jar" />
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Total balance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: '2px',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
                marginBottom: '0.25rem',
              }}>
                Total Unlocked
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                color: 'var(--color-gold)',
                lineHeight: 1,
              }}>
                ${jar?.totalUnlockedBalance.toFixed(2) ?? '0.00'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
                marginBottom: '0.25rem',
              }}>
                Weekly Max
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1,
              }}>
                ${jar?.currentWeekMaxEarn.toFixed(2) ?? '50.00'}
              </p>
            </div>
          </div>

          {/* This week progress */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
              }}>
                This Week
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                color: 'var(--color-gold)',
              }}>
                {weekPercent}% — ${jar?.currentWeekUnlockedAmount.toFixed(2) ?? '0.00'}
              </span>
            </div>
            <div style={{
              height: '8px',
              background: 'var(--color-border)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${weekPercent}%`,
                background: 'linear-gradient(90deg, var(--color-gold-dim), var(--color-gold))',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Weekly breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
          }}>
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
      <div style={cardStyle}>
        <div style={{
          padding: '0.6rem 0.75rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              Wish List
            </span>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            style={{
              background: 'none',
              border: '1px solid var(--color-border-bright)',
              borderRadius: '2px',
              color: 'var(--color-text-muted)',
              padding: '0.25rem 0.6rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
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
            {showAddForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface-raised)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <FieldLabel text="Item" />
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. New gaming headset"
                  style={inputStyle}
                />
              </div>
              <div>
                <FieldLabel text="Est. Cost ($)" />
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  placeholder="150"
                  style={{ ...inputStyle, width: '100px' }}
                />
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newLabel.trim() || adding}
                style={{
                  padding: '0.55rem 1rem',
                  border: '1px solid var(--color-gold)',
                  borderRadius: '2px',
                  background: 'var(--color-gold)',
                  color: '#0d0d0d',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: !newLabel.trim() || adding ? 0.5 : 1,
                }}
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
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Wish list items */}
        {wishList.length === 0 ? (
          <p style={{
            padding: '1rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            fontSize: '0.9rem',
          }}>
            No items yet. Add something to work toward.
          </p>
        ) : (
          wishList.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: item.isUnlocked ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '1rem',
                  color: item.isUnlocked ? 'var(--color-green-bright)' : 'var(--color-text-faint)',
                }}>
                  {item.isUnlocked ? '✓' : '○'}
                </span>
                <div>
                  <p style={{
                    color: item.isUnlocked ? 'var(--color-text-muted)' : 'var(--color-text)',
                    fontSize: '0.95rem',
                    textDecoration: item.isUnlocked ? 'line-through' : 'none',
                  }}>
                    {item.label}
                  </p>
                  {item.milestoneTrigger && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-faint)',
                      fontStyle: 'italic',
                    }}>
                      Unlocks on: {item.milestoneTrigger}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {item.estimatedCost && (
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    color: 'var(--color-gold-dim)',
                  }}>
                    ${item.estimatedCost.toFixed(2)}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-faint)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1,
                    padding: '0.2rem',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = 'var(--color-red-bright)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'var(--color-text-faint)')
                  }
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
    <div style={{
      padding: '0.75rem',
      background: 'var(--color-surface-raised)',
      border: `1px solid ${achieved ? 'var(--color-green-bright)' : 'var(--color-border)'}`,
      borderRadius: '2px',
    }}>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--color-text-faint)',
        marginBottom: '0.3rem',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '1rem',
        color: achieved ? 'var(--color-green-bright)' : 'var(--color-text)',
        fontFamily: 'var(--font-display)',
      }}>
        {value}
      </p>
      <p style={{
        fontSize: '0.7rem',
        color: 'var(--color-text-faint)',
        marginTop: '0.15rem',
      }}>
        {detail}
      </p>
    </div>
  )
}

function FieldLabel({ text }: { text: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-display)',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--color-text-faint)',
      display: 'block',
      marginBottom: '0.3rem',
    }}>
      {text}
    </span>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  overflow: 'hidden',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-bright)',
  borderRadius: '2px',
  color: 'var(--color-text)',
  padding: '0.55rem 0.75rem',
  fontSize: '0.95rem',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  width: '100%',
}