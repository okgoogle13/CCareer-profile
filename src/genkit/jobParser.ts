import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
});

export const parseJobFlow = ai.defineFlow(
  {
    name: "parseJobFlow",
    inputSchema: z.string(),
    outputSchema: z.object({
      JobTitle: z.string(),
      Company: z.string(),
      Key_Responsibilities: z.array(z.string()),
      Required_Skills: z.array(z.string()),
      Preferred_Skills: z.array(z.string()),
    }),
  },
  async (jobDescription) => {
    const response = await ai.generate({
      model: "gemini-3-flash-preview",
      prompt: `Parse the following job description and extract key information: ${jobDescription}`,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "{}");
  }
);
