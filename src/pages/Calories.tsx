import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Plus, Flame, Trash2, UtensilsCrossed } from 'lucide-react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis } from 'recharts'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ActionSheet } from '../components/ui/ActionSheet'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { EmptyState } from '../components/ui/EmptyState'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useNutrition, MEAL_LABELS } from '../context/NutritionContext'
import { useProfile } from '../context/ProfileContext'
import type { FoodEntry, MealType } from '../types'
import { dateKey } from '../lib/format'
import { subDays, format } from 'date-fns'
import { cn } from '../lib/cn'

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function Calories() {
  const { profile } = useProfile()
  const { entriesForDate, totalsForDate, addFood, removeFood, recentFoods } = useNutrition()
  const [open, setOpen] = useState(false)

  const entries = entriesForDate()
  const totals = totalsForDate()
  const goal = profile.goals.calories
  const remaining = Math.max(0, goal - totals.calories)
  const pct = Math.min(100, Math.round((totals.calories / goal) * 100))

  const macroData = useMemo(
    () => [
      { name: 'Protein', value: totals.protein * 4, color: '#CCFF00' },
      { name: 'Carbs', value: totals.carbs * 4, color: '#00E5FF' },
      { name: 'Fat', value: totals.fat * 9, color: '#FF6B35' },
    ],
    [totals],
  )
  const hasMacros = totals.protein + totals.carbs + totals.fat > 0

  const weekly = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i)
        const kcal = totalsForDate(dateKey(d)).calories
        return { day: format(d, 'EEEEE'), value: kcal, over: kcal > goal }
      }),
    [totalsForDate, goal],
  )
  const hasWeekly = weekly.some((d) => d.value > 0)

  return (
    <>
      <TopBar title="Calories" />
      <PageLayout>
        {/* Summary */}
        <GlassCard>
          <div className="flex items-center gap-5">
            <div className="relative h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hasMacros ? macroData : [{ name: 'empty', value: 1, color: '#1A1A1A' }]}
                    dataKey="value"
                    innerRadius={44}
                    outerRadius={62}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    paddingAngle={hasMacros ? 3 : 0}
                  >
                    {(hasMacros ? macroData : [{ color: '#1A1A1A' }]).map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-data text-xl text-txt-primary">
                  <CountUp end={totals.calories} duration={1} separator="," />
                </span>
                <span className="text-[10px] uppercase tracking-wide text-txt-tertiary">kcal</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-txt-secondary">Daily goal</p>
              <p className="text-data text-2xl text-txt-primary">{goal.toLocaleString()}</p>
              <p className="mt-1 text-sm">
                <span className={cn(remaining === 0 ? 'text-warning' : 'text-lime')}>
                  {remaining.toLocaleString()}
                </span>{' '}
                <span className="text-txt-tertiary">kcal left</span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-orange-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>

          {/* Macro legend */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
            <MacroLegend label="Protein" grams={totals.protein} color="#CCFF00" />
            <MacroLegend label="Carbs" grams={totals.carbs} color="#00E5FF" />
            <MacroLegend label="Fat" grams={totals.fat} color="#FF6B35" />
          </div>
        </GlassCard>

        <Button full className="mt-4" icon={<Plus size={18} />} onClick={() => setOpen(true)}>
          Log Food
        </Button>

        {/* Meals */}
        {entries.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Nothing logged yet"
            description="Add your first meal to start tracking calories & macros."
            color="#FF6B35"
          />
        ) : (
          <div className="mt-6 space-y-5">
            {MEALS.map((meal) => {
              const items = entries.filter((e) => e.meal === meal)
              if (items.length === 0) return null
              const mealCals = items.reduce((s, e) => s + e.calories, 0)
              return (
                <div key={meal}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-txt-primary">
                      {MEAL_LABELS[meal]}
                    </h3>
                    <span className="text-xs text-txt-secondary">{mealCals} kcal</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((e) => (
                      <FoodRow key={e.id} entry={e} onDelete={() => removeFood(e.id)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Weekly chart */}
        {hasWeekly && (
          <>
            <SectionHeader title="This Week" />
            <GlassCard>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#5A5A5E', fontSize: 11 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 4, 4]} maxBarSize={22}>
                      {weekly.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.value === 0 ? '#1F1F1F' : d.over ? '#FF3B30' : '#FF6B35'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-[11px] text-txt-tertiary">
                Red bars exceeded your {goal.toLocaleString()} kcal goal
              </p>
            </GlassCard>
          </>
        )}
      </PageLayout>

      <AddFoodSheet
        open={open}
        onClose={() => setOpen(false)}
        recent={recentFoods}
        onAdd={(f) => {
          addFood(f)
          setOpen(false)
        }}
      />
    </>
  )
}

function MacroLegend({ label, grams, color }: { label: string; grams: number; color: string }) {
  return (
    <div className="text-center">
      <div className="mb-1 flex items-center justify-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-[11px] text-txt-secondary">{label}</span>
      </div>
      <p className="text-data text-base text-txt-primary">{Math.round(grams)}g</p>
    </div>
  )
}

function FoodRow({ entry, onDelete }: { entry: FoodEntry; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-bg-surface px-3 py-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-accent/10">
        <Flame size={16} className="text-orange-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-txt-primary">{entry.name}</p>
        <p className="text-[11px] text-txt-tertiary">
          P{Math.round(entry.protein)} · C{Math.round(entry.carbs)} · F{Math.round(entry.fat)}
        </p>
      </div>
      <span className="text-sm font-semibold text-txt-primary">{entry.calories}</span>
      <button onClick={onDelete} className="text-txt-tertiary active:text-error" aria-label="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function AddFoodSheet({
  open,
  onClose,
  recent,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  recent: FoodEntry[]
  onAdd: (f: Omit<FoodEntry, 'id' | 'createdAt' | 'date'>) => void
}) {
  const [meal, setMeal] = useState<MealType>('breakfast')
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  const reset = () => {
    setName('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
  }

  const submit = () => {
    if (!name.trim() || !calories) return
    onAdd({
      name: name.trim(),
      meal,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    })
    reset()
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Log Food">
      <SegmentedControl
        value={meal}
        onChange={setMeal}
        options={MEALS.map((m) => ({ value: m, label: MEAL_LABELS[m] }))}
        className="mb-4"
      />

      {recent.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-txt-secondary">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setName(r.name)
                  setCalories(String(r.calories))
                  setProtein(String(r.protein))
                  setCarbs(String(r.carbs))
                  setFat(String(r.fat))
                }}
                className="rounded-full bg-bg-surface px-3 py-1.5 text-xs text-txt-secondary active:brightness-90"
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Input
          label="Food name"
          placeholder="e.g. Chicken & rice"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Calories"
          type="number"
          inputMode="numeric"
          placeholder="0"
          suffix="kcal"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2">
          <Input label="Protein" type="number" inputMode="numeric" placeholder="0" suffix="g" value={protein} onChange={(e) => setProtein(e.target.value)} />
          <Input label="Carbs" type="number" inputMode="numeric" placeholder="0" suffix="g" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          <Input label="Fat" type="number" inputMode="numeric" placeholder="0" suffix="g" value={fat} onChange={(e) => setFat(e.target.value)} />
        </div>
      </div>

      <Button full size="lg" className="mt-5" disabled={!name.trim() || !calories} onClick={submit}>
        Add to {MEAL_LABELS[meal]}
      </Button>
    </ActionSheet>
  )
}
