import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    const modelList = await genAI.listModels();
    console.log('Available models:');
    for (const model of modelList.models) {
      console.log(`- ${model.name} (Methods: ${model.supportedGenerationMethods.join(', ')})`);
    }
  } catch (err) {
    console.error('Error listing models:', err.message);
  }
}

listModels();
