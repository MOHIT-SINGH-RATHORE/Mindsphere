
import { PrismaClient } from '@prisma/client';
import { GamificationService } from './src/services/gamification.service';
import { AnalyticsService } from './src/services/AnalyticsService';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting debug script...');

    // 1. Create or Find Test User
    const email = 'debug_user@example.com';
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('Creating test user...');
        user = await prisma.user.create({
            data: {
                email,
                password: 'password123',
                name: 'Debug User'
            }
        });
    }
    const userId = user.id;
    console.log(`User ID: ${userId}`);

    // 2. Test Gamification
    console.log('Testing Gamification...');
    const initialXP = user.currentXP;
    const result = await GamificationService.awardXP(userId, 300, 'DEBUG_SESSION'); // 5 mins -> 50 XP
    console.log('Gamification Result:', result);

    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    if (updatedUser && updatedUser.currentXP > initialXP) {
        console.log(`SUCCESS: XP updated from ${initialXP} to ${updatedUser.currentXP}`);
    } else {
        console.error('FAILURE: XP not updated!');
    }

    // 3. Create a completed session for Analytics
    console.log('Creating dummy session...');
    await prisma.learningSession.create({
        data: {
            userId,
            contentId: 'dummy-content-id', // Assuming valid content ID not strictly required by DB unless FK constraint
            startTime: new Date(),
            endTime: new Date(),
            duration: 300,
            isCompleted: true
        }
    });

    // Note: contentId is FK. We need a content.
    const content = await prisma.content.findFirst();
    if (content) {
        await prisma.learningSession.create({
            data: {
                userId,
                contentId: content.id,
                startTime: new Date(),
                endTime: new Date(),
                duration: 300,
                isCompleted: true
            }
        });
    } else {
        console.log("No content found, skipping session creation properly.");
    }


    // 4. Test Analytics Generation
    console.log('Testing Analytics Generation...');
    try {
        const report = await AnalyticsService.generateWeeklyReport(userId);
        console.log('Report JSON:', JSON.stringify(report, null, 2));

        if (report && Array.isArray(report.chartData)) {
            console.log('SUCCESS: report.chartData is an Array.');
        } else {
            console.log('FAILURE: report.chartData is NOT an Array:', typeof report.chartData);
        }

    } catch (error) {
        console.error('FAILURE: Analytics generation threw error:', error);
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
