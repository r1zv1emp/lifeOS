import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding achievements...')

  const achievements = [
    { name: 'First Step', description: 'Complete your first habit', icon: '🎯', xpReward: 50, category: 'habits', condition: { type: 'habit_count', value: 1 } },
    { name: 'Habit Builder', description: 'Complete 7 habits in a row', icon: '⚡', xpReward: 100, category: 'habits', condition: { type: 'streak', value: 7 } },
    { name: 'Consistency King', description: 'Maintain a 30-day streak', icon: '👑', xpReward: 500, category: 'habits', condition: { type: 'streak', value: 30 } },
    { name: 'Iron Will', description: 'Complete 100 habits total', icon: '🏆', xpReward: 200, category: 'habits', condition: { type: 'total_habits', value: 100 } },
    { name: 'Gym Rat', description: 'Log your first workout', icon: '💪', xpReward: 50, category: 'fitness', condition: { type: 'workout_count', value: 1 } },
    { name: 'Athlete', description: 'Log 20 workouts', icon: '🏋️', xpReward: 150, category: 'fitness', condition: { type: 'workout_count', value: 20 } },
    { name: 'Sleep Master', description: 'Log 30 nights of sleep', icon: '😴', xpReward: 150, category: 'sleep', condition: { type: 'sleep_count', value: 30 } },
    { name: 'Warrior', description: 'Reach 30 days clean on any recovery', icon: '🛡️', xpReward: 300, category: 'recovery', condition: { type: 'recovery_streak', value: 30 } },
    { name: 'Scholar', description: 'Write 10 journal entries', icon: '📚', xpReward: 100, category: 'journal', condition: { type: 'journal_count', value: 10 } },
    { name: 'Deep Worker', description: 'Complete 10 focus sessions', icon: '🧠', xpReward: 100, category: 'productivity', condition: { type: 'focus_count', value: 10 } },
    { name: 'Level 5', description: 'Reach Level 5', icon: '⭐', xpReward: 0, category: 'level', condition: { type: 'level', value: 5 } },
    { name: 'Legend', description: 'Achieve a discipline score of 90+', icon: '🌟', xpReward: 500, category: 'discipline', condition: { type: 'discipline_score', value: 90 } },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.name.toLowerCase().replace(/\s+/g, '_') },
      update: achievement,
      create: { ...achievement, id: achievement.name.toLowerCase().replace(/\s+/g, '_') },
    })
  }

  console.log('✅ Seeded achievements')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
