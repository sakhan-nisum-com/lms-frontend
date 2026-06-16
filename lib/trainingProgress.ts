import type { TrainingTrack } from "@/lib/data/trainings"

type ProgressStore = Record<string, string[]>

// Merges a track's statically-seeded module completion with whatever the
// learner has marked complete on the training detail page (tracked in
// localStorage), the same way getCourseProgress does for courses.
export function getTrainingProgress(track: TrainingTrack, store: ProgressStore) {
  const completedFromStore = new Set(store[track.id] ?? [])
  const totalModules = track.modules.length
  const completedModules = track.modules.filter((m) => m.completed || completedFromStore.has(m.id)).length
  const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : track.progress
  const isComplete = totalModules > 0 ? progressPct === 100 : track.progress === 100

  return { totalModules, completedModules, progressPct, isComplete }
}
