
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("API Key not found in .env");
  process.exit(1);
}

async function listModels(version: string) {
  console.log(`--- Models for ${version} ---`);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`);
    const data = await response.json() as any;
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`${m.name}: ${m.supportedGenerationMethods}`);
      });
    } else {
      console.log(`No models found or error for ${version}:`, data);
    }
  } catch (error) {
    console.error(`Error listing models for ${version}:`, error);
  }
}

async function run() {
  await listModels("v1");
  await listModels("v1beta");
}

run();
