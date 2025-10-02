import { GoogleGenAI, Type } from "@google/genai";
import type { InstagramContent } from '../types';

const fileToGenerativePart = (file: File): Promise<{mimeType: string, data: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
      }
      // The result includes the data URL prefix, so we need to remove it.
      const base64Data = reader.result.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    caption: { type: Type.STRING },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["title", "caption", "hashtags"],
};

const parseAndValidateResponse = (responseText: string): InstagramContent => {
    try {
        const parsedJson = JSON.parse(responseText);
        
        if (
            typeof parsedJson.title === 'string' &&
            typeof parsedJson.caption === 'string' &&
            Array.isArray(parsedJson.hashtags) &&
            parsedJson.hashtags.every((tag: unknown) => typeof tag === 'string')
        ) {
            return parsedJson as InstagramContent;
        } else {
            throw new Error("AI response does not match the expected format.");
        }
    } catch (error) {
        console.error("Failed to parse AI response:", responseText);
        throw new Error("Could not parse the generated content. The AI may have returned an unexpected format.");
    }
};

export const generateInstagramContentFromVideo = async (videoFile: File, context?: string): Promise<InstagramContent> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const videoPart = await fileToGenerativePart(videoFile);

  const contextPrompt = context ? `The user has provided the following context about the video: "${context}". Please take this into account.` : '';

  const prompt = `
    Analyze this video and generate content for an Instagram post.
    ${contextPrompt}
    The content should be engaging, relevant to the video, and tailored for the Instagram platform.
    
    Provide the following in a JSON format:
    1.  "title": A short, catchy title (max 15 words).
    2.  "caption": A descriptive and engaging caption (2-4 sentences).
    3.  "hashtags": An array of 5-10 relevant and popular hashtags (as an array of strings, without the '#' symbol).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: videoPart },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });

  return parseAndValidateResponse(response.text);
};


export const refineInstagramContent = async (
  videoFile: File,
  currentContent: InstagramContent,
  refinementPrompt: string
): Promise<InstagramContent> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const videoPart = await fileToGenerativePart(videoFile);

  const prompt = `
    Analyze this video. You previously generated the following content for an Instagram post:
    Title: ${currentContent.title}
    Caption: ${currentContent.caption}
    Hashtags: ${currentContent.hashtags.join(', ')}

    Now, the user wants to refine this with the following instruction: "${refinementPrompt}"

    Please generate a new version of the title, caption, and hashtags based on this instruction, ensuring it remains relevant to the original video.
    Provide the output in the same JSON format as before.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: videoPart },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });

  return parseAndValidateResponse(response.text);
};
