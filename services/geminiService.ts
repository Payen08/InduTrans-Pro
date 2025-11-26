import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TranslationResult } from "../types";
import { SYSTEM_INSTRUCTION, SUPPORTED_LANGUAGES } from "../constants";

// Helper to remove trailing periods
const cleanText = (text: string) => {
  if (!text) return "";
  return text.trim().replace(/\.$/, '');
};

const buildSchema = (targetLanguages: string[]): Schema => {
  const properties: any = {
    original: { type: Type.STRING, description: "The original source text" },
  };
  const required = ["original"];

  targetLanguages.forEach(code => {
    properties[code] = { type: Type.STRING, description: `Translation for ${code}` };
    required.push(code);
  });

  return {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties,
      required,
    },
  };
};

const getApiKey = (): string => {
  // 1. 尝试从 Vite 环境变量获取
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // 2. 尝试从 localStorage 获取
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) {
    return storedKey;
  }
  // 3. 尝试从旧的 process.env 获取 (兼容性)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return "";
};

export const translateBatch = async (texts: string[], targetLanguages: string[]): Promise<TranslationResult[]> => {
  if (texts.length === 0) return [];

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("未配置 Gemini API 密钥。请在设置中配置或检查环境变量。");
  }

  const ai = new GoogleGenAI({ apiKey });

  const languagesListText = targetLanguages.map(code => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return `- ${lang?.name} (key: "${code}")`;
  }).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // 更新为更稳定的模型名称，或者保持 gemini-1.5-flash
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Please translate the following list of industrial terms into these specific target languages:\n${languagesListText}\n\nInput List:\n${JSON.stringify(texts)}`
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: buildSchema(targetLanguages),
        temperature: 0.1,
      },
    });

    const rawJson = response.text; // response.text 是一个 getter
    if (!rawJson) {
      throw new Error("No response text received from Gemini.");
    }

    const parsedData = JSON.parse(rawJson);

    // Map to our dynamic type
    return parsedData.map((item: any, index: number) => {
      const translations: { [key: string]: string } = {};
      targetLanguages.forEach(code => {
        translations[code] = cleanText(item[code] || "");
      });

      return {
        id: `${Date.now()}-${index}`,
        original: item.original || texts[index],
        translations
      };
    });

  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

