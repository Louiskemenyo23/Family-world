import { GoogleGenAI } from "@google/genai";

// FIX: Initialize GoogleGenAI directly with API key from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMenuDescription = async (itemName: string, ingredients: string): Promise<string> => {
  try {
    // FIX: Updated model name from 'gemini-2.5-flash' to 'gemini-3-flash-preview' for basic text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, appetizing, mouth-watering menu description (max 25 words) for a dish named "${itemName}" containing: ${ingredients}. Do not use hashtags or markdown.`,
    });
    return response.text || "Freshly prepared for you.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "A classic favorite prepared with fresh ingredients.";
  }
};

export const getManagerInsights = async (metrics: any): Promise<string> => {
  try {
    // FIX: Updated model name from 'gemini-2.5-flash' to 'gemini-3-flash-preview' for basic text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert Restaurant Manager. Analyze these daily metrics and give 3 bullet points of advice/insight. Keep it brief.
      Metrics: ${JSON.stringify(metrics)}`,
    });
    return response.text || "Keep up the good work!";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Unable to generate insights at this moment.";
  }
};
