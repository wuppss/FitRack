import type { ReactNode } from 'react'
import { ProfileProvider } from './ProfileContext'
import { ExerciseProvider } from './ExerciseContext'
import { WorkoutProvider } from './WorkoutContext'
import { NutritionProvider } from './NutritionContext'
import { WaterProvider } from './WaterContext'
import { StepsProvider } from './StepsContext'
import { TemplateProvider } from './TemplateContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <ExerciseProvider>
        <WorkoutProvider>
          <TemplateProvider>
            <NutritionProvider>
              <WaterProvider>
                <StepsProvider>{children}</StepsProvider>
              </WaterProvider>
            </NutritionProvider>
          </TemplateProvider>
        </WorkoutProvider>
      </ExerciseProvider>
    </ProfileProvider>
  )
}
