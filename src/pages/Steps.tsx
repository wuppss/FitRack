import { useMemo, useState } from 'react'
import CountUp from 'react-countup'
import { Plus, Footprints, Flame, MapPin, Settings2 } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, XAxis } from 'recharts'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { ProgressRing } from '../components/ui/ProgressRing'
import { ActionSheet } from '../components/ui/ActionSheet'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useSteps } from '../context/StepsContext'
import { useProfile } from '../context/ProfileContext'
import { dateKey } from '../lib/format'
import { subDays, format } from 'date-fns'

const QUICK_ADDS = [500, 1000, 2500]

export default function Steps() {
  const { today, addSteps, setSteps, forDate } = useSteps()
  const { profile, updateGoals } = useProfile()
  const goal = profile.goals.steps
  const [open, setOpen] = useState(false)
  const [manual, setManual] = useState('')
  const [goalOpen, setGoalOpen] = useState(false)
  const [goalInput, setGoalInput] = useState(String(goal))

  const pct = Math.min(100, Math.round((today / goal) * 100))
  // rough estimates
  const km = (today * 0.000762).toFixed(2)
  const kcal = Math.round(today * 0.04 * (profile.weight / 70))

  const weekly = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i)
        return { day: format(d, 'EEEEE'), value: forDate(dateKey(d)) }
      }),
    [forDate],
  )

  return (
    <>
      <TopBar
        title="Steps"
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
        {/* Ring */}
        <div className="flex flex-col items-center py-4">
          <ProgressRing progress={pct} size={220} strokeWidth={14} color="#CCFF00">
            <Footprints size={26} className="mb-1 text-lime" />
            <span className="text-data text-4xl text-txt-primary">
              <CountUp end={today} duration={1.4} separator="," />
            </span>
            <span className="text-xs text-txt-secondary">/ {goal.toLocaleString()} steps</span>
            <span className="mt-1 text-data text-sm text-lime">{pct}%</span>
          </ProgressRing>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-accent/10">
              <MapPin size={18} className="text-cyan-accent" />
            </div>
            <div>
              <p className="text-data text-lg text-txt-primary">{km}</p>
              <p className="text-[11px] text-txt-tertiary">km walked</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-accent/10">
              <Flame size={18} className="text-orange-accent" />
            </div>
            <div>
              <p className="text-data text-lg text-txt-primary">{kcal}</p>
              <p className="text-[11px] text-txt-tertiary">kcal burned</p>
            </div>
          </GlassCard>
        </div>

        {/* Quick add */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {QUICK_ADDS.map((amt) => (
            <button
              key={amt}
              onClick={() => addSteps(amt)}
              className="flex flex-col items-center gap-1 rounded-lg border border-lime/20 bg-lime/[0.06] py-4 active:brightness-110"
            >
              <Footprints size={18} className="text-lime" />
              <span className="text-sm font-semibold text-txt-primary">+{amt.toLocaleString()}</span>
            </button>
          ))}
        </div>

        <Button full variant="secondary" className="mt-3" icon={<Plus size={16} />} onClick={() => {
          setManual(String(today))
          setOpen(true)
        }}>
          Set exact count
        </Button>

        {/* Weekly */}
        <SectionHeader title="This Week" />
        <GlassCard>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CCFF00" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#CCFF00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#5A5A5E', fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#CCFF00"
                  strokeWidth={2.5}
                  fill="url(#stepGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </PageLayout>

      <ActionSheet open={open} onClose={() => setOpen(false)} title="Set Step Count">
        <Input
          label="Steps today"
          type="number"
          inputMode="numeric"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          autoFocus
        />
        <Button
          full
          size="lg"
          className="mt-4"
          onClick={() => {
            setSteps(Math.max(0, Number(manual) || 0))
            setOpen(false)
          }}
        >
          Save
        </Button>
      </ActionSheet>

      <ActionSheet open={goalOpen} onClose={() => setGoalOpen(false)} title="Daily Step Goal">
        <Input
          label="Goal"
          type="number"
          inputMode="numeric"
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
            if (v > 0) updateGoals({ steps: v })
            setGoalOpen(false)
          }}
        >
          Save Goal
        </Button>
      </ActionSheet>
    </>
  )
}
