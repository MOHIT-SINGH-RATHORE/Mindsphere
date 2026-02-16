import { prisma } from '../db';

export class AnalyticsService {

  static async generateWeeklyReport(userId: string) {
    const now = new Date();

    // Get Monday start of week
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);

    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    // Get completed sessions
    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        isCompleted: true,
        startTime: { gte: weekStart }
      }
    });

    const totalSessions = sessions.length;

    const totalProductiveMins = Math.floor(
      sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    );

    // Get XP earned this week
    const xpLogs = await prisma.xPTransaction.findMany({
      where: {
        userId,
        createdAt: { gte: weekStart }
      }
    });

    const totalXP = xpLogs.reduce((sum, x) => sum + x.amount, 0);

    // Engagement score (0–1 scale)
    const IDEAL_WEEKLY_MINS = 300;
    const score = Math.min(totalProductiveMins / IDEAL_WEEKLY_MINS, 1);

    // 4. Generate Chart Data (Daily Breakdown)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyStats = new Array(7).fill(0).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return {
        day: days[d.getDay()],
        date: d.toLocaleDateString('en-CA'), // YYYY-MM-DD
        minutes: 0
      };
    });

    sessions.forEach(s => {
      const sTime = new Date(s.startTime); // Ensure it's a Date object
      const dayIndex = Math.floor((sTime.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyStats[dayIndex].minutes += Math.round((s.duration || 0) / 60);
      }
    });

    const report = await prisma.weeklyReport.upsert({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: weekStart
        }
      },
      update: {
        totalSessions,
        totalProductiveMins,
        score,
        chartData: dailyStats
      },
      create: {
        userId,
        weekStartDate: weekStart,
        totalSessions,
        totalProductiveMins,
        score,
        chartData: dailyStats
      }
    });

    return report;
  }

  static async getLatestWeeklyReport(userId: string) {
    return prisma.weeklyReport.findFirst({
      where: { userId },
      orderBy: { weekStartDate: 'desc' }
    });
  }
}
