import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

export const geminiTextClassification = async (
  input: string
): Promise<string[]> => {
  const apiKey = process.env.GEMINI_API_KEY; // Replace with your API key
  if (apiKey) {
    const generationConfig = {
      temperature: 0.5,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 60,
      responseMimeType: "text/plain",
    };
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt =
      "Which category does this text belong to? Your options are Health, Education and Career, Government and Utilities, Finance, Family and Relationships, Warranties and Memberships, Social and Leisure, Personal. Only return three words, which should be the categories.\n\n" +
      input;

    try {
      const chatSession = await model.startChat({
        generationConfig,
        history: [],
      });
      const res = await chatSession.sendMessage(prompt);

      // Parse the response to extract the top 3 categories
      const responseText = await res.response.text();
      const categories = responseText
        .split("\n")
        .map((line) => line.replace(/^- /, "").trim()) // Remove hyphens and trim spaces
        .filter(Boolean)
        .slice(0, 3); // Get the top 3 categories
      return categories;
    } catch (error) {
      console.error("Error during text classification:", error);
      return [];
    }
  } else {
    console.error("API key is undefined");
    return [];
  }
};
