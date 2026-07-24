import type { ReactNode } from 'react'
import { ProfileProvider } from './ProfileContext'
import { ExerciseProvider } from './ExerciseContext'
import { WorkoutProvider } from './WorkoutContext'
import { NutritionProvider } from './NutritionContext'
import { WaterProvider } from './WaterContext'
import { StepsProvider } from './StepsContext'
import { TemplateProvider } from './TemplateContext'
import { FavoritesProvider } from './FavoritesContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <ExerciseProvider>
        <FavoritesProvider>
          <WorkoutProvider>
            <TemplateProvider>
              <NutritionProvider>
                <WaterProvider>
                  <StepsProvider>{children}</StepsProvider>
                </WaterProvider>
              </NutritionProvider>
            </TemplateProvider>
          </WorkoutProvider>
        </FavoritesProvider>
      </ExerciseProvider>
    </ProfileProvider>
  )
}
