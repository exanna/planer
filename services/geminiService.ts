import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DayType, ScheduleItem } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateSchedule = async (dayType: DayType, focus: string): Promise<ScheduleItem[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Stwórz plan dnia. Typ dnia: ${dayType === DayType.WORK ? 'Dzień Pracujący' : 'Dzień Wolny'}. 
  Główny cel/skupienie: ${focus || 'Zrównoważony dzień'}.
  Plan powinien zawierać około 5-10 punktów od rana do wieczora. 
  Dla każdego punktu podaj godzinę rozpoczęcia (startTime) i zakończenia (endTime) w formacie HH:MM.`;

  // Define the schema using the recommended structure
  const scheduleSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        startTime: { type: Type.STRING, description: "Godzina rozpoczęcia HH:MM (np. 08:00)" },
        endTime: { type: Type.STRING, description: "Godzina zakończenia HH:MM (np. 09:30)" },
        activity: { type: Type.STRING, description: "Opis czynności po polsku" },
      },
      required: ["startTime", "endTime", "activity"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scheduleSchema,
        systemInstruction: "Jesteś asystentem produktywności. Generuj realistyczne i zwięzłe plany dnia w języku polskim z logicznymi przedziałami czasowymi.",
      },
    });

    const rawData = response.text;
    if (!rawData) return [];

    const parsedData = JSON.parse(rawData);
    
    // Map response to our internal structure adding IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parsedData.map((item: any) => ({
      id: generateId(),
      startTime: item.startTime,
      endTime: item.endTime,
      activity: item.activity
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};