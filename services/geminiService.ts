import { GoogleGenAI } from "@google/genai";
import { AlphabetItem } from "../types";

// Initialize responsibly. If API Key is missing or invalid strings, it will be handled in the function.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateBirdFunFact = async (item: AlphabetItem): Promise<string> => {
  // Strict check for a valid-looking key to prevent 403/404 HTML errors from proxy
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
    return `Did you know? ${item.word} starts with the letter ${item.letter}! It's amazing!`;
  }

  try {
    const prompt = `
      You are a cute, energetic little bird character in a game for 5-year-old kids.
      The kid has just arrived at the letter "${item.letter}" which stands for "${item.word}".
      The visual shows a ${item.word} (${item.emoji}).
      
      Write a VERY short, 1-sentence fun fact or a rhyme about the ${item.word}.
      Keep it simple, encouraging, and under 15 words.
      Do not use complex words.
      Do not include "Bird:" prefix.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || `${item.word} starts with ${item.letter}! Wow!`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback text
    return `Look! It's a ${item.word}. ${item.letter} is for ${item.word}!`;
  }
};