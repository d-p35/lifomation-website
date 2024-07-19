import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
// Initialize IBM Watson NLU
const apiKey = process.env.GEMINI_API_KEY; // Replace with your API key
if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"});
} else {
  // Handle the case when apiKey is undefined
  console.error("API key is undefined");
}





