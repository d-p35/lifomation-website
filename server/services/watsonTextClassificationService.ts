import { IamAuthenticator } from "ibm-watson/auth";
import NaturalLanguageUnderstandingV1 from "ibm-watson/natural-language-understanding/v1";
import dotenv from "dotenv";

dotenv.config();
// Initialize IBM Watson NLU
const apiKey = process.env.API_KEY; // Replace with your API key
const serviceUrl = process.env.SERVICE_URL; // Replace with your service URL

if (!apiKey || !serviceUrl) {
  throw new Error(
    "Missing required environment variables: API_KEY or SERVICE_URL"
  );
}

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: "2022-04-07",
  authenticator: new IamAuthenticator({ apikey: apiKey }),
  serviceUrl: serviceUrl,
});

export const classifyText = async (input: string): Promise<any> => {
  // Define the targets for emotion analysis
  const targets = [
    "Health",
    "Education and Career",
    "Government and Utilities",
    "Finance",
    "Family and Relationships",
    "Warranties and Memberships",
    "Social and Leisure",
    "Personal",
  ];


  // Set up the features for analysis
  const features = {
    categories: {
      limit: 3,
    },
  };

  // Create the parameters for the analysis
  const analyzeParams = {
    text: input,
    features: features,
  };


  try {
    // Perform the analysis
    const response = await naturalLanguageUnderstanding
      .analyze(analyzeParams)
      .then((analysisResults) => {
        console.log(JSON.stringify(analysisResults, null, 2));
      })
      .catch((err) => {
        console.log("error:", err);
      });
  } catch (error) {
    console.error("Error while analyzing text:", error);
    throw error;
  }
};
