
import { EmailService } from './src/services/email.service';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('--- Testing EmailService ---');
    const service = new EmailService();

    // Test parameters
    const to = 'mehga214@gmail.com';
    const subject = 'Test Email from MindSphere Debugger';
    const html = '<h1>It Works!</h1><p>This is a test email using your custom EmailService implementation.</p>';

    console.log(`Attempting to send email to ${to}...`);

    try {
        await service.sendEmail(to, subject, html);
        console.log('✅ SUCCESS: Email sent successfully.');
    } catch (error: any) {
        console.log('❌ FAILED: Could not send email.');
        // The service already logs the error, but let's be explicit here too
    }
}

test();
