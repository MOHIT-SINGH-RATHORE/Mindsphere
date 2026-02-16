
import { EmailService } from './src/services/email.service';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('--- Verifying Notification Flow ---');
    console.log('User: btechcusat07@gmail.com');
    // We expect the password to be maskd or not shown, but we know it's in .env

    const service = new EmailService();

    // Use the exact email from .env to test sending TO itself (easiest test)
    const to = process.env.SMTP_USER || 'btechcusat07@gmail.com';
    const subject = 'MindSphere Notification Test';
    const html = '<h1>It Works!</h1><p>Your notification system is fully functional.</p>';

    console.log(`Sending test email to ${to}...`);

    try {
        await service.sendEmail(to, subject, html);
        console.log('✅ SUCCESS: Email sent successfully.');
    } catch (error: any) {
        console.log('❌ FAILED: Could not send email.');
        console.error(error);
    }
}

test();
