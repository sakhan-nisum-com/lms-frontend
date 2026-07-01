export interface StudyGroup {
  id: string
  trainingId: string
  name: string
  description: string
  emoji: string
  color: string
  nextMeeting?: string
  createdBy: string
  memberIds: string[]
}

export const STUDY_GROUP_SEED: StudyGroup[] = [
  {
    id: "sg1",
    trainingId: "tt5",
    name: "React & Next.js Study Circle",
    description: "Weekly pairing on the React and Next.js modules — code along and review each other's components.",
    emoji: "⚛️",
    color: "#3B82F6",
    nextMeeting: "Jun 14 · 11:00 AM",
    createdBy: "Sarah Chen",
    memberIds: ["stu-001", "stu-003", "stu-005", "stu-006"],
  },
  {
    id: "sg2",
    trainingId: "tt1",
    name: "Architecture Prep Group",
    description: "Working through the system architecture and capstone review modules together.",
    emoji: "🏗️",
    color: "#8B5CF6",
    nextMeeting: "Jun 14 · 11:00 AM",
    createdBy: "Sarah Chen",
    memberIds: ["stu-002", "stu-004", "stu-007"],
  },
  {
    id: "sg3",
    trainingId: "tt5",
    name: "TypeScript Deep Dives",
    description: "Diving into the TypeScript for Frontend Engineers module with extra practice problems.",
    emoji: "🔷",
    color: "#2563EB",
    nextMeeting: "Jun 15 · 3:00 PM",
    createdBy: "Sarah Chen",
    memberIds: ["stu-001", "stu-008"],
  },
]
