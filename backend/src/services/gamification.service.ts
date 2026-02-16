import { prisma } from '../db';

export class GamificationService {
  private static readonly XP_PER_MINUTE = 10;
  private static readonly LEVEL_BASE_XP = 100;

  static async awardXP(userId: string, durationSeconds: number, source: string = 'SESSION') {
    const minutes = durationSeconds / 60;
    const xpEarned = Math.round(minutes * this.XP_PER_MINUTE);

    if (xpEarned <= 0) {
      return { message: "No XP awarded" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error("User not found");
    }

    let newXP = user.currentXP + xpEarned;
    let newLevel = user.level;
    let xpRequired = newLevel * this.LEVEL_BASE_XP;

    while (newXP >= xpRequired) {
      newXP -= xpRequired;
      newLevel++;
      xpRequired = newLevel * this.LEVEL_BASE_XP;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentXP: newXP,
        level: newLevel,
        lastActivity: new Date()
      }
    });

    await prisma.xPTransaction.create({
      data: {
        userId,
        amount: xpEarned,
        source
      }
    });

    return {
      xpEarned,
      newXP,
      newLevel
    };
  }

  static async updateStreak(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const now = new Date();
    const lastActivity = new Date(user.lastActivity);

    // Check if last activity was yesterday
    const isYesterday = (
      now.getDate() - lastActivity.getDate() === 1 &&
      now.getMonth() === lastActivity.getMonth() &&
      now.getFullYear() === lastActivity.getFullYear()
    );

    // If successfully yesterday, increment streak
    if (isYesterday) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentStreak: { increment: 1 } }
      });
    } else if (now.getDate() !== lastActivity.getDate()) {
      // If gap is more than 1 day (and not today), reset streak
      // Wait, if last activity was today, we do nothing.
      // If gap > 1 day, reset.
      const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        await prisma.user.update({
          where: { id: userId },
          data: { currentStreak: 1 } // Reset to 1 since they are active today
        });
      }
    }
  }
}

// Keep old export for compatibility if needed, but optimally remove it.
// For now, let's stick to the class.

