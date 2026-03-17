import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
});

export const matchAnalysisFlow = ai.defineFlow(
  {
    name: "matchAnalysisFlow",
    inputSchema: z.object({
      job: z.any(),
      careerData: z.any(),
    }),
    outputSchema: z.any(),
  },
  async ({ job, careerData }) => {
    const prompt = `
      You are an expert career coach and ATS optimization specialist.
      Analyze the user's Career Database against the provided Job Opportunity.
      
      Job Opportunity:
      ${JSON.stringify(job, null, 2)}
      
      User's Career Database:
      ${JSON.stringify(careerData, null, 2)}
      
      Perform the following:
      1. Calculate an Overall_Fit_Score (0-100) based on skill overlap and experience.
      2. Identify Skill_Gaps. For each required hard/soft skill in the job posting, determine the Match_Level ("Strong", "Partial", "Missing") based on the user's Master_Skills_Inventory and Career_Entries. Provide brief Evidence from the user's profile.
      3. Write a Tailored_Summary (3-4 sentences) that the user can put at the top of their resume, specifically highlighting their most relevant experience for this exact role.
      4. Provide a Headline_Suggestion (e.g., "Senior Software Engineer | React Specialist") that positions the candidate perfectly for this role.
      5. Recommend 3-5 Achievement_IDs from the user's Structured_Achievements that are most relevant to this job's Key_Responsibilities.
      6. Draft a highly tailored Cover_Letter (3-4 paragraphs) that connects the user's specific achievements and values to the company's needs and culture keywords.
      
      Return the result as a JSON object.
    `;

    const response = await ai.generate({
      model: "gemini-3.1-pro-preview",
      prompt: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });
    return JSON.parse(response.text || "{}");
  }
);
