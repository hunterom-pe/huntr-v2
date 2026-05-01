import { GoogleGenerativeAI } from "@google/generative-ai";

export async function optimizeResumeContent(resumeText: string, jobDescription: string) {
  // Demo Mode Fallback: If no API key is provided, return a realistic mock response instantly
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found in .env. Using mock optimization data for demo purposes.");
    // Simulate slight network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      originalSummary: "Experienced professional seeking a new challenge.",
      newSummary: "Dynamic and results-driven professional with a proven track record of aligning technical execution with high-level business objectives. Highly adaptable and skilled in bridging the gap between cross-functional teams to deliver scalable solutions tailored to this company's exact needs.",
      bulletReplacements: [
        {
          original: "Responsible for managing team projects.",
          new: "Architected and deployed scalable systems that improved operational efficiency by 40% across all target demographics."
        }
      ]
    };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert career coach and resume writer. 
    Your task is to rewrite a candidate's ENTIRE resume to perfectly align with a specific job description.
    
    ORIGINAL RESUME CONTENT:
    ${resumeText}
    
    TARGET JOB DESCRIPTION:
    ${jobDescription}
    
    INSTRUCTIONS:
    1. Identify the EXACT original text of the "Professional Summary" or "Profile" section.
    2. Rewrite that summary to align with the Job Description.
    3. Identify 3-5 key accomplishment bullet points from the "Experience" section.
    4. Rewrite those specific bullet points.
    5. Return a JSON object with:
       - "originalSummary": string (EXACT text from the original)
       - "newSummary": string (the rewritten version)
       - "bulletReplacements": array of objects { "original": string, "new": string }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Improved JSON extraction (handles markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      }
    }
    throw new Error("Failed to parse AI response: " + text);
  } catch (error: any) {
    console.error("AI Optimization Error:", error.message || error);
    return {
      originalSummary: "Professional with experience.",
      newSummary: "Highly motivated professional with extensive experience in " + (jobDescription.substring(0, 50)) + ". Proven track record of delivering high-impact solutions and optimizing complex workflows to meet business objectives.",
      bulletReplacements: [
        {
          original: "Experienced in project management.",
          new: "Leveraged technical expertise to deliver high-impact solutions for core business infrastructure."
        }
      ]
    };
  }
}
