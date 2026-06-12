import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIAnalysisResult {
    priority: 'Emergency' | 'High' | 'Medium' | 'Low';
    suggestedDept: string;
    analysis: string;
    actionItems: string[];
}

export const aiService = {
    /**
     * Analyze an issue description using Gemini AI
     */
    async analyzeIssue(description: string, category: string): Promise<AIAnalysisResult> {
        if (!API_KEY) {
            console.warn("AI Service: VITE_GEMINI_API_KEY not found. Using fallback logic.");
            return this.getFallbackAnalysis(description, category);
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a smart city incident analyzer for 'FixMyCity'.
                Analyze the following citizen report and return a JSON object.
                
                Category: ${category}
                Report: "${description}"

                Rules:
                - Priority Levels: Emergency (threat to life/safety), High (significant disruption), Medium (routine maintenance), Low (cosmetic/minor).
                - Suggested Dept: One of [Public Works, Sanitation, Water Board, Electrical Dept, Public Safety, Traffic Control].
                
                Expected JSON format:
                {
                  "priority": "Emergency" | "High" | "Medium" | "Low",
                  "suggestedDept": "Department Name",
                  "analysis": "Short 1-sentence analytical summary",
                  "actionItems": ["Step 1", "Step 2"]
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from markdown code blocks if present
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error("Failed to parse AI response");
        } catch (error) {
            console.error("AI Analysis Error:", error);
            return this.getFallbackAnalysis(description, category);
        }
    },

    /**
     * Fallback logic if API key is missing or fails
     */
    getFallbackAnalysis(description: string, category: string): AIAnalysisResult {
        let priority: AIAnalysisResult['priority'] = 'Medium';
        let suggestedDept = 'Public Works';

        const desc = description.toLowerCase();

        if (desc.includes('danger') || desc.includes('fire') || desc.includes('harm') || desc.includes('injury')) {
            priority = 'Emergency';
        } else if (desc.includes('broken') || desc.includes('not working') || desc.includes('urgent')) {
            priority = 'High';
        }

        if (category.includes('Water')) suggestedDept = 'Water Board';
        if (category.includes('Electricity') || category.includes('Light')) suggestedDept = 'Electrical Dept';
        if (category.includes('Garbage') || category.includes('Sanitation')) suggestedDept = 'Sanitation';
        if (category.includes('Traffic')) suggestedDept = 'Traffic Control';
        if (category.includes('Safety')) suggestedDept = 'Public Safety';

        return {
            priority,
            suggestedDept,
            analysis: "Pattern-based heuristic analysis applied (Fallback Mode).",
            actionItems: ["Verify incident on-site", "Assign team to location"]
        };
    }
};
