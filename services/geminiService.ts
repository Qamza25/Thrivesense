import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please set the environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

const wellnessAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallMood: {
            type: Type.STRING,
            description: "A single word describing the user's overall mood (e.g., Joyful, Stressed, Calm, Anxious, Content, Sad)."
        },
        moodScore: {
            type: Type.NUMBER,
            description: "A numerical score from 1 (very negative) to 10 (very positive) representing the user's mood."
        },
        keyEmotions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 2-3 key emotions detected from the text and other inputs."
        },
        feedback: {
            type: Type.STRING,
            description: "Compassionate and constructive feedback (2-3 sentences). Acknowledge their feelings and offer encouragement, considering their sleep and stress levels."
        },
        activitySuggestion: {
            type: Type.STRING,
            description: "A simple, actionable wellness activity suggestion based on their mood, stress, and sleep (e.g., 'Try a 5-minute guided meditation.', 'Consider a short walk outside.')."
        }
    },
    required: ["overallMood", "moodScore", "keyEmotions", "feedback", "activitySuggestion"]
};

interface WellnessParams {
    text: string;
    sleepHours: number;
    stressLevel: number;
}

const buildBasePrompt = ({ text, sleepHours, stressLevel }: WellnessParams): string => {
    const textPrompt = text.trim() 
        ? `User's journal entry: "${text}".` 
        : "The user did not provide a written journal entry.";

    return `As an expert AI wellness assistant, analyze the user's emotional state based on their self-reported metrics and any provided media (text or image).
${textPrompt}
Self-reported metrics:
- Sleep: ${sleepHours} hours
- Stress Level: ${stressLevel}/10.

Your analysis should be empathetic, insightful, and supportive. Provide a structured JSON response based on the required schema.`;
}

export const analyzeWellness = async (params: WellnessParams & { imageBase64: string; imageMimeType: string; }): Promise<AIAnalysisResult> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: params.imageMimeType,
                data: params.imageBase64,
            },
        };

        const basePrompt = buildBasePrompt(params);
        const instruction = params.text.trim()
            ? "Also consider their facial expression in the provided image to refine your analysis."
            : "The user has provided an image instead of a text entry. Analyze their emotional state primarily from their facial expression in the image, using the other metrics as context.";
        
        const textPart = {
            text: `${basePrompt} ${instruction}`,
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: wellnessAnalysisSchema,
                temperature: 0.7,
            },
        });
        
        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        
        return result as AIAnalysisResult;

    } catch (error) {
        console.error("Error analyzing wellness with Gemini API:", error);
        throw new Error("Failed to get analysis from AI. Please try again.");
    }
};

export const analyzeWellnessTextOnly = async (params: WellnessParams): Promise<AIAnalysisResult> => {
    try {
        const textPart = {
            text: buildBasePrompt(params),
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: wellnessAnalysisSchema,
                temperature: 0.7,
            },
        });
        
        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        
        return result as AIAnalysisResult;

    } catch (error) {
        console.error("Error analyzing wellness with Gemini API (text only):", error);
        throw new Error("Failed to get analysis from AI. Please try again.");
    }
};