import nodemailer from 'nodemailer';

async function verify() {
    console.log('--- Verifying Email Credentials ---');

    // Potential Typo Check
    const email1 = 'mehga214@gmail.com';
    const email2 = 'megha214@gmail.com'; // Common spelling
    const pass = '12345678';

    console.log(`1. Testing: ${email1} ...`);
    await test(email1, pass);

    console.log(`\n2. Testing (Common Spelling): ${email2} ...`);
    await test(email2, pass);
}

async function test(user: string, pass: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });

    try {
        await transporter.verify();
        console.log(`✅ SUCCESS! Credentials for ${user} are correct.`);
    } catch (error: any) {
        console.log(`❌ FAILED for ${user}.`);
        if (error.responseCode === 535) {
            console.log('   Reason: Username and Password not accepted (Google blocked it).');
        } else {
            console.log(`   Reason: ${error.message}`);
        }
    }
}

verify();
