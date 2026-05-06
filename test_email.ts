import { sendWelcomeEmail } from './src/lib/email';
import * as dotenv from 'dotenv';

dotenv.config();

async function test() {
  console.log("--- STARTING EMAIL ENGINE TEST ---");
  console.log("Using API Key:", process.env.RESEND_API_KEY?.substring(0, 5) + "...");
  
  const testEmail = "hello@precisionqaconsulting.com"; // Testing to your own verified email is safest
  console.log("Target Email:", testEmail);
  
  await sendWelcomeEmail(testEmail, "Test Admin");
  console.log("--- TEST COMPLETE ---");
}

test();
