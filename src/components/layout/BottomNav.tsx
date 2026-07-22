import { Home, Dumbbell, Flame, Droplets, User, Plus } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

const TABS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/calories', label: 'Calories', icon: Flame },
  { to: '/water', label: 'Water', icon: Droplets },
  { to: '/profile', label: 'Profile', icon: User },
] as const

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Hide chrome during the full-screen active workout.
  if (pathname.startsWith('/active-workout')) return null

  return (
    <nav className="glass-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06]">
      <div className="relative mx-auto flex h-20 max-w-[428px] items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {/* Center FAB */}
        <motion.button
          type="button"
          onClick={() => navigate('/active-workout')}
          whileTap={{ scale: 0.9 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-0 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-5 items-center justify-center rounded-full bg-lime text-black shadow-glow-lime-strong"
          aria-label="Start workout"
        >
          <Plus size={26} strokeWidth={2.5} />
        </motion.button>

        {TABS.map((tab, i) => {
          const Icon = tab.icon
          // leave a gap in the middle for the FAB
          const isThird = i === 2
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 pt-2',
                isThird && 'ml-8',
                i === 1 && 'mr-8',
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-lime' : 'text-txt-tertiary',
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium tracking-wide transition-colors',
                      isActive ? 'text-lime' : 'text-txt-tertiary',
                    )}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="h-1 w-1 rounded-full bg-lime"
                    />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
