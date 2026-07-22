import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import WorkoutHub from './pages/WorkoutHub'
import ExerciseLibrary from './pages/ExerciseLibrary'
import ExerciseDetail from './pages/ExerciseDetail'
import ActiveWorkout from './pages/ActiveWorkout'
import Calories from './pages/Calories'
import Water from './pages/Water'
import Steps from './pages/Steps'
import History from './pages/History'
import Stats from './pages/Stats'
import Profile from './pages/Profile'

export default function App() {
  const location = useLocation()
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutHub />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/active-workout" element={<ActiveWorkout />} />
          <Route path="/calories" element={<Calories />} />
          <Route path="/water" element={<Water />} />
          <Route path="/steps" element={<Steps />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </>
  )
}
