import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Ruler,
  Weight,
  Cake,
  Flame,
  Droplets,
  Footprints,
  Dumbbell,
  KeyRound,
  Beef,
  Download,
  Upload,
  Loader2,
  Check,
  ChevronRight,
  Trash2,
  Database,
  Activity,
  Target,
  Gauge,
  History as HistoryIcon,
  BarChart3,
} from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ActionSheet } from '../components/ui/ActionSheet'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useProfile } from '../context/ProfileContext'
import { useExercises } from '../context/ExerciseContext'
import { useWorkout } from '../context/WorkoutContext'
import {
  getApiKey,
  setApiKey,
  getGifResolution,
  setGifResolution,
  MONTHLY_REQUEST_LIMIT,
  type GifResolution,
} from '../lib/exercisedb'
import { exportData, importData } from '../lib/backup'
import { cn } from '../lib/cn'
import { titleCase } from '../lib/format'
import type { ActivityLevel } from '../types'

export default function Profile() {
  const navigate = useNavigate()
  const { profile, updateProfile, bmr, tdee } = useProfile()
  const { history } = useWorkout()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    syncedCount,
    syncing,
    progress,
    syncError,
    startSync,
    cancelSync,
    usageCount,
    lastSyncedAt,
  } = useExercises()

  const [bodyOpen, setBodyOpen] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)
  const [apiOpen, setApiOpen] = useState(false)

  const requestsLeft = Math.max(0, MONTHLY_REQUEST_LIMIT - usageCount)
  const usagePct = Math.min(100, (usageCount / MONTHLY_REQUEST_LIMIT) * 100)

  return (
    <>
      <TopBar title="Profile" />
      <PageLayout>
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-lime/30 to-lime/5 ring-1 ring-lime/20">
            <span className="font-display text-2xl font-bold text-lime">
              {profile.name.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full bg-transparent font-display text-xl font-bold text-txt-primary outline-none"
              aria-label="Name"
            />
            <p className="text-xs capitalize text-txt-secondary">
              {profile.gender} · {profile.age} yrs · {titleCase(profile.activityLevel.replace('_', ' '))}
            </p>
          </div>
        </div>

        {/* Energy */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <GlassCard className="text-center">
            <Gauge size={18} className="mx-auto mb-1 text-lime" />
            <p className="text-data text-xl text-txt-primary">{bmr.toLocaleString()}</p>
            <p className="text-[10px] uppercase tracking-wide text-txt-tertiary">BMR kcal</p>
          </GlassCard>
          <GlassCard className="text-center">
            <Activity size={18} className="mx-auto mb-1 text-orange-accent" />
            <p className="text-data text-xl text-txt-primary">{tdee.toLocaleString()}</p>
            <p className="text-[10px] uppercase tracking-wide text-txt-tertiary">TDEE kcal</p>
          </GlassCard>
        </div>

        {/* Body stats */}
        <SectionHeader
          title="Body Stats"
          action={
            <button onClick={() => setBodyOpen(true)} className="text-xs text-lime">
              Edit
            </button>
          }
        />
        <GlassCard className="grid grid-cols-3 gap-2">
          <BodyStat icon={Weight} label="Weight" value={`${profile.weight} kg`} />
          <BodyStat icon={Ruler} label="Height" value={`${profile.height} cm`} />
          <BodyStat icon={Cake} label="Age" value={`${profile.age}`} />
        </GlassCard>

        {/* Goals */}
        <SectionHeader
          title="Daily Goals"
          action={
            <button onClick={() => setGoalsOpen(true)} className="text-xs text-lime">
              Edit
            </button>
          }
        />
        <GlassCard className="space-y-3">
          <GoalRow icon={Flame} color="#FF6B35" label="Calories" value={`${profile.goals.calories.toLocaleString()} kcal`} />
          <GoalRow
            icon={Beef}
            color="#CCFF00"
            label="Macros P / C / F"
            value={`${profile.goals.protein} / ${profile.goals.carbs} / ${profile.goals.fat} g`}
          />
          <GoalRow icon={Droplets} color="#00E5FF" label="Water" value={`${profile.goals.water.toLocaleString()} ml`} />
          <GoalRow icon={Footprints} color="#CCFF00" label="Steps" value={profile.goals.steps.toLocaleString()} />
          <GoalRow icon={Dumbbell} color="#B967FF" label="Workouts / week" value={String(profile.goals.weeklyWorkouts)} />
        </GlassCard>

        {/* Units */}
        <SectionHeader title="Units" />
        <SegmentedControl
          value={profile.units}
          onChange={(v) => updateProfile({ units: v })}
          options={[
            { value: 'metric', label: 'Metric (kg, cm)' },
            { value: 'imperial', label: 'Imperial (lb, ft)' },
          ]}
        />

        {/* Exercise library / API */}
        <SectionHeader title="Exercise Library" />
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-accent/10">
              <Database size={20} className="text-cyan-accent" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-txt-primary">ExerciseDB Sync</p>
              <p className="text-xs text-txt-secondary">
                {syncedCount > 0
                  ? `${syncedCount} exercises cached${lastSyncedAt ? '' : ''}`
                  : 'Not synced yet — using 12 starter exercises'}
              </p>
            </div>
          </div>

          {/* Monthly usage meter */}
          <div className="mt-4 rounded-md bg-bg-surface p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-txt-secondary">Monthly API requests</span>
              <span className="font-semibold text-txt-primary">
                {usageCount} / {MONTHLY_REQUEST_LIMIT}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn('h-full rounded-full', usagePct > 85 ? 'bg-error' : 'bg-lime')}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-txt-tertiary">
              {requestsLeft} left this month (Basic plan). A full sync uses ~130.
            </p>
          </div>

          {syncError && <p className="mt-3 text-xs text-error">{syncError}</p>}

          {syncing ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-txt-secondary">
                <Loader2 size={16} className="animate-spin text-lime" />
                Syncing… {progress?.fetched ?? 0} exercises fetched
              </div>
              <Button full variant="secondary" onClick={cancelSync}>
                Stop
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <Button
                full
                variant="secondary"
                icon={<KeyRound size={16} />}
                onClick={() => setApiOpen(true)}
              >
                {getApiKey() ? 'API Key' : 'Add Key'}
              </Button>
              <Button
                full
                icon={syncedCount > 0 ? <Check size={16} /> : <Download size={16} />}
                disabled={!getApiKey() || requestsLeft < 1}
                onClick={() => void startSync()}
              >
                {syncedCount > 0 ? 'Re-sync' : 'Sync now'}
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Navigation shortcuts */}
        <SectionHeader title="More" />
        <div className="space-y-2">
          <NavRow icon={HistoryIcon} label="Workout History" onClick={() => navigate('/history')} />
          <NavRow icon={BarChart3} label="Statistics" onClick={() => navigate('/progress')} />
          <NavRow icon={Footprints} label="Steps Tracker" onClick={() => navigate('/steps')} />
        </div>

        {/* Data management */}
        <SectionHeader title="Data" />
        <div className="mb-2 grid grid-cols-2 gap-2">
          <Button variant="secondary" icon={<Download size={16} />} onClick={exportData}>
            Export
          </Button>
          <Button
            variant="secondary"
            icon={<Upload size={16} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = '' // allow re-selecting the same file
            if (!file) return
            try {
              const n = await importData(file)
              alert(`Restored ${n} data section${n === 1 ? '' : 's'}. Reloading…`)
              location.reload()
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Import failed.')
            }
          }}
        />
        <button
          onClick={() => {
            if (confirm('Reset ALL app data? This clears profile, logs and workout history.')) {
              localStorage.clear()
              location.reload()
            }
          }}
          className="flex w-full items-center gap-3 rounded-lg border border-error/20 bg-error/[0.06] p-4 text-left active:brightness-110"
        >
          <Trash2 size={18} className="text-error" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error">Reset all data</p>
            <p className="text-xs text-txt-tertiary">
              {history.length} workouts · clears everything on this device
            </p>
          </div>
        </button>

        <p className="mt-6 text-center text-[11px] text-txt-tertiary">
          FITRACK · Offline-first · Data stored on your device
        </p>
      </PageLayout>

      <BodyStatsSheet open={bodyOpen} onClose={() => setBodyOpen(false)} />
      <GoalsSheet open={goalsOpen} onClose={() => setGoalsOpen(false)} />
      <ApiKeySheet open={apiOpen} onClose={() => setApiOpen(false)} />
    </>
  )
}

function GoalsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, updateGoals, tdee } = useProfile()
  const [cal, setCal] = useState(String(profile.goals.calories))
  const [protein, setProtein] = useState(String(profile.goals.protein))
  const [carbs, setCarbs] = useState(String(profile.goals.carbs))
  const [fat, setFat] = useState(String(profile.goals.fat))
  const [water, setWater] = useState(String(profile.goals.water))
  const [steps, setSteps] = useState(String(profile.goals.steps))
  const [workouts, setWorkouts] = useState(String(profile.goals.weeklyWorkouts))

  // Auto-split calories into a balanced macro target:
  // protein 1.8 g/kg bodyweight, fat 25% of kcal, remainder carbs.
  const autoMacros = () => {
    const kcal = Number(cal) || profile.goals.calories
    const p = Math.round(profile.weight * 1.8)
    const f = Math.round((kcal * 0.25) / 9)
    const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4))
    setProtein(String(p))
    setFat(String(f))
    setCarbs(String(c))
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Edit Goals">
      <div className="space-y-3">
        <div>
          <Input label="Calories (kcal)" type="number" value={cal} onChange={(e) => setCal(e.target.value)} />
          <button
            type="button"
            onClick={() => setCal(String(tdee))}
            className="mt-1.5 text-xs text-lime"
          >
            Use TDEE estimate ({tdee.toLocaleString()} kcal)
          </button>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-txt-secondary">Macros (g)</span>
            <button type="button" onClick={autoMacros} className="text-xs text-lime">
              Auto-calculate
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Protein" type="number" suffix="g" value={protein} onChange={(e) => setProtein(e.target.value)} />
            <Input label="Carbs" type="number" suffix="g" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            <Input label="Fat" type="number" suffix="g" value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
          <p className="mt-1.5 text-[11px] text-txt-tertiary">
            ≈ {Number(protein) * 4 + Number(carbs) * 4 + Number(fat) * 9 || 0} kcal from macros
          </p>
        </div>

        <Input label="Water (ml)" type="number" value={water} onChange={(e) => setWater(e.target.value)} />
        <Input label="Steps" type="number" value={steps} onChange={(e) => setSteps(e.target.value)} />
        <Input label="Workouts per week" type="number" value={workouts} onChange={(e) => setWorkouts(e.target.value)} />
      </div>
      <Button
        full
        size="lg"
        className="mt-5"
        onClick={() => {
          updateGoals({
            calories: Number(cal) || profile.goals.calories,
            protein: Number(protein) || profile.goals.protein,
            carbs: Number(carbs) || profile.goals.carbs,
            fat: Number(fat) || profile.goals.fat,
            water: Number(water) || profile.goals.water,
            steps: Number(steps) || profile.goals.steps,
            weeklyWorkouts: Number(workouts) || profile.goals.weeklyWorkouts,
          })
          onClose()
        }}
      >
        Save Goals
      </Button>
    </ActionSheet>
  )
}

function BodyStatsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, updateProfile, logWeight } = useProfile()
  const [weight, setWeight] = useState(String(profile.weight))
  const [height, setHeight] = useState(String(profile.height))
  const [age, setAge] = useState(String(profile.age))
  const [gender, setGender] = useState(profile.gender)
  const [activity, setActivity] = useState<ActivityLevel>(profile.activityLevel)
  return (
    <ActionSheet open={open} onClose={onClose} title="Body Stats">
      <SegmentedControl
        value={gender}
        onChange={setGender}
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]}
        className="mb-4"
      />
      <div className="grid grid-cols-3 gap-2">
        <Input label="Weight" type="number" suffix="kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <Input label="Height" type="number" suffix="cm" value={height} onChange={(e) => setHeight(e.target.value)} />
        <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
      </div>
      <p className="mb-2 mt-4 text-xs font-medium text-txt-secondary">Activity level</p>
      <div className="space-y-2">
        {(
          [
            ['sedentary', 'Sedentary — little exercise'],
            ['light', 'Light — 1-3 days/week'],
            ['moderate', 'Moderate — 3-5 days/week'],
            ['active', 'Active — 6-7 days/week'],
            ['very_active', 'Very active — hard daily'],
          ] as [ActivityLevel, string][]
        ).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setActivity(val)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm',
              activity === val
                ? 'bg-lime/15 text-txt-primary ring-1 ring-lime/40'
                : 'bg-bg-surface text-txt-secondary',
            )}
          >
            {label}
            {activity === val && <Check size={16} className="text-lime" />}
          </button>
        ))}
      </div>
      <Button
        full
        size="lg"
        className="mt-5"
        onClick={() => {
          const kg = Number(weight)
          if (kg > 0 && kg !== profile.weight) logWeight(kg)
          updateProfile({
            height: Number(height) || profile.height,
            age: Number(age) || profile.age,
            gender,
            activityLevel: activity,
          })
          onClose()
        }}
      >
        Save
      </Button>
    </ActionSheet>
  )
}

function ApiKeySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [key, setKey] = useState(getApiKey())
  const [res, setRes] = useState<GifResolution>(getGifResolution())
  return (
    <ActionSheet open={open} onClose={onClose} title="ExerciseDB API">
      <p className="mb-3 text-xs leading-relaxed text-txt-secondary">
        Paste your RapidAPI key for ExerciseDB. It's stored only in your browser and used to sync
        the exercise catalog. On the Basic plan you get 690 requests / month — a full sync uses
        about 130.
      </p>
      <Input
        label="RapidAPI Key"
        placeholder="xxxxxxxx-msh-xxxx…"
        icon={<KeyRound size={16} />}
        value={key}
        onChange={(e) => setKey(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <p className="mb-2 mt-4 text-xs font-medium text-txt-secondary">GIF resolution</p>
      <SegmentedControl
        value={res}
        onChange={setRes}
        options={[
          { value: '180', label: '180p' },
          { value: '360', label: '360p' },
          { value: '720', label: '720p' },
          { value: '1080', label: '1080p' },
        ]}
      />
      <p className="mt-2 text-[11px] text-txt-tertiary">
        Higher resolution GIFs look sharper but download slower.
      </p>
      <Button
        full
        size="lg"
        className="mt-5"
        icon={<Check size={18} />}
        onClick={() => {
          setApiKey(key)
          setGifResolution(res)
          onClose()
        }}
      >
        Save
      </Button>
    </ActionSheet>
  )
}

function BodyStat({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon size={16} className="mx-auto mb-1 text-txt-secondary" />
      <p className="text-data text-base text-txt-primary">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-txt-tertiary">{label}</p>
    </div>
  )
}

function GoalRow({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: typeof Flame
  color: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} style={{ color }} />
      <span className="flex-1 text-sm text-txt-secondary">{label}</span>
      <span className="text-sm font-semibold text-txt-primary">{value}</span>
    </div>
  )
}

function NavRow({ icon: Icon, label, onClick }: { icon: typeof Target; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-bg-elevated p-4 text-left active:brightness-95"
    >
      <Icon size={18} className="text-txt-secondary" />
      <span className="flex-1 text-sm font-medium text-txt-primary">{label}</span>
      <ChevronRight size={18} className="text-txt-tertiary" />
    </button>
  )
}
