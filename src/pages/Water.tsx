import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Plus, Minus, Flame, Droplets, Settings2 } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { ActionSheet } from '../components/ui/ActionSheet'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useWater } from '../context/WaterContext'
import { useProfile } from '../context/ProfileContext'
import { dateKey } from '../lib/format'
import { subDays, format } from 'date-fns'

const QUICK_ADDS = [250, 500, 750]

export default function Water() {
  const { today, addWater, forDate, streak } = useWater()
  const { profile, updateGoals } = useProfile()
  const goal = profile.goals.water
  const [customOpen, setCustomOpen] = useState(false)
  const [custom, setCustom] = useState('')
  const [goalOpen, setGoalOpen] = useState(false)
  const [goalInput, setGoalInput] = useState(String(goal))

  const pct = Math.min(100, (today / goal) * 100)
  const current = streak(goal)

  const weekly = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i)
        const ml = forDate(dateKey(d))
        return { day: format(d, 'EEEEE'), value: ml, met: ml >= goal }
      }),
    [forDate, goal],
  )

  return (
    <>
      <TopBar
        title="Water"
        right={
          <button
            onClick={() => {
              setGoalInput(String(goal))
              setGoalOpen(true)
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-txt-secondary active:bg-white/5"
          >
            <Settings2 size={20} />
          </button>
        }
      />
      <PageLayout>
        {/* Bottle */}
        <div className="flex flex-col items-center py-2">
          <div className="relative h-64 w-40">
            {/* bottle outline */}
            <div className="absolute inset-0 overflow-hidden rounded-[36px] border-2 border-cyan-accent/30 bg-cyan-accent/[0.03]">
              {/* fill */}
              <motion.div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-accent to-cyan-accent/60"
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              >
                {/* wave */}
                <div className="absolute -top-2 left-0 h-4 w-[200%] animate-[wave_3s_linear_infinite]">
                  <svg viewBox="0 0 400 20" className="h-full w-full" preserveAspectRatio="none">
                    <path
                      d="M0 10 Q 50 0 100 10 T 200 10 T 300 10 T 400 10 V20 H0 Z"
                      fill="#00E5FF"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              </motion.div>
            </div>
            {/* bottle neck */}
            <div className="absolute -top-3 left-1/2 h-6 w-10 -translate-x-1/2 rounded-t-md border-2 border-b-0 border-cyan-accent/30 bg-bg-primary" />
            {/* label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-data text-3xl text-txt-primary drop-shadow">
                <CountUp end={today} duration={1} separator="," />
              </span>
              <span className="text-xs text-txt-secondary">/ {goal.toLocaleString()} ml</span>
              <span className="mt-1 text-data text-sm text-cyan-accent">{Math.round(pct)}%</span>
            </div>
          </div>
        </div>

        {/* Quick add */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {QUICK_ADDS.map((amt) => (
            <motion.button
              key={amt}
              whileTap={{ scale: 0.95 }}
              onClick={() => addWater(amt)}
              className="flex flex-col items-center gap-1 rounded-lg border border-cyan-accent/20 bg-cyan-accent/[0.06] py-4 active:brightness-110"
            >
              <Droplets size={20} className="text-cyan-accent" />
              <span className="text-sm font-semibold text-txt-primary">+{amt}</span>
              <span className="text-[10px] text-txt-tertiary">ml</span>
            </motion.button>
          ))}
        </div>

        <div className="mt-3 flex gap-3">
          <Button
            variant="secondary"
            full
            icon={<Minus size={16} />}
            onClick={() => addWater(-250)}
            disabled={today <= 0}
          >
            Remove 250ml
          </Button>
          <Button variant="secondary" full icon={<Plus size={16} />} onClick={() => setCustomOpen(true)}>
            Custom
          </Button>
        </div>

        {/* Streak */}
        <GlassCard className="mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-accent/10">
            <Flame size={20} className="text-orange-accent" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-txt-primary">
              {current} day{current === 1 ? '' : 's'} streak
            </p>
            <p className="text-xs text-txt-secondary">
              {current > 0 ? 'Keep it flowing!' : 'Hit your goal today to start a streak.'}
            </p>
          </div>
        </GlassCard>

        {/* Weekly chart */}
        <SectionHeader title="This Week" />
        <GlassCard>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#5A5A5E', fontSize: 11 }} />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} maxBarSize={22}>
                  {weekly.map((d, i) => (
                    <Cell key={i} fill={d.met ? '#00E5FF' : '#1F2A2E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </PageLayout>

      {/* Custom amount */}
      <ActionSheet open={customOpen} onClose={() => setCustomOpen(false)} title="Custom Amount">
        <Input
          label="Amount"
          type="number"
          inputMode="numeric"
          placeholder="0"
          suffix="ml"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          autoFocus
        />
        <Button
          full
          size="lg"
          className="mt-4"
          disabled={!custom || Number(custom) <= 0}
          onClick={() => {
            addWater(Number(custom))
            setCustom('')
            setCustomOpen(false)
          }}
        >
          Add Water
        </Button>
      </ActionSheet>

      {/* Goal editor */}
      <ActionSheet open={goalOpen} onClose={() => setGoalOpen(false)} title="Daily Water Goal">
        <Input
          label="Goal"
          type="number"
          inputMode="numeric"
          suffix="ml"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          autoFocus
        />
        <Button
          full
          size="lg"
          className="mt-4"
          onClick={() => {
            const v = Number(goalInput)
            if (v > 0) updateGoals({ water: v })
            setGoalOpen(false)
          }}
        >
          Save Goal
        </Button>
      </ActionSheet>
    </>
  )
}
