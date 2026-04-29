import { GoogleGenerativeAI } from "@google/generative-ai";

export async function optimizeResumeContent(resumeText: string, jobDescription: string) {
  // Demo Mode Fallback: If no API key is provided, return a realistic mock response instantly
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found in .env. Using mock optimization data for demo purposes.");
    // Simulate slight network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      summary: "Dynamic and results-driven professional with a proven track record of aligning technical execution with high-level business objectives. Highly adaptable and skilled in bridging the gap between cross-functional teams to deliver scalable solutions tailored to this company's exact needs.",
      bulletPoints: [
        "Architected and deployed scalable systems that improved operational efficiency by 40% across all target demographics.",
        "Spearheaded agile methodologies and streamlined testing protocols, resulting in a 25% reduction in time-to-market.",
        "Collaborated directly with stakeholders to align technical deliverables with core business KPIs, driving a 15% increase in user retention."
      ]
    };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert career coach and resume writer. 
    Your task is to rewrite specific parts of a candidate's resume to better align with a specific job description.
    
    RESUME CONTENT:
    ${resumeText}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    INSTRUCTIONS:
    1. Identify the top 5 relevant keywords from the job description.
    2. Rewrite the "Professional Summary" or "Profile" section to incorporate these keywords naturally.
    3. Suggest modifications to 3-5 bullet points in the "Experience" section to highlight relevant accomplishments.
    4. Maintain a professional, non-cyberpunk, easy-to-read tone.
    5. Return the result in a JSON format with 'summary' and 'bulletPoints' (array of strings).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("AI Optimization Error:", error);
    return null;
  }
}
