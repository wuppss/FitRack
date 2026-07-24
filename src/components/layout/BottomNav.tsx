import { Home, Compass, Dumbbell, LineChart, User, Plus } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

const LEFT = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
] as const

const RIGHT = [
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/profile', label: 'Profile', icon: User },
] as const

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Hide chrome during the full-screen active workout.
  if (pathname.startsWith('/active-workout')) return null

  const workoutActive = pathname.startsWith('/workout')

  return (
    <nav className="glass-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06]">
      <div className="relative mx-auto flex h-20 max-w-[428px] items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {LEFT.map((tab) => (
          <Tab key={tab.to} {...tab} />
        ))}

        {/* Center workout FAB */}
        <div className="flex flex-1 items-start justify-center pt-2">
          <motion.button
            type="button"
            onClick={() => navigate('/workout')}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'flex h-14 w-14 -translate-y-4 flex-col items-center justify-center rounded-full text-black shadow-glow-lime-strong',
              'bg-lime',
            )}
            aria-label="Workout"
          >
            {workoutActive ? (
              <Dumbbell size={24} strokeWidth={2.5} />
            ) : (
              <Plus size={26} strokeWidth={2.5} />
            )}
          </motion.button>
        </div>

        {RIGHT.map((tab) => (
          <Tab key={tab.to} {...tab} />
        ))}
      </div>
    </nav>
  )
}

function Tab({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: typeof Home
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="flex flex-1 flex-col items-center justify-center gap-1 pt-2"
    >
      {({ isActive }) => (
        <>
          <Icon
            size={22}
            strokeWidth={isActive ? 2.5 : 1.5}
            className={cn('transition-colors', isActive ? 'text-lime' : 'text-txt-tertiary')}
          />
          <span
            className={cn(
              'text-[10px] font-medium tracking-wide transition-colors',
              isActive ? 'text-lime' : 'text-txt-tertiary',
            )}
          >
            {label}
          </span>
          {isActive && <motion.span layoutId="nav-dot" className="h-1 w-1 rounded-full bg-lime" />}
        </>
      )}
    </NavLink>
  )
}
