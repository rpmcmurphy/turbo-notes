import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(GeminiService.name);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateTags(title: string, content: string): Promise<string[]> {
    try {
      const prompt = `
        Analyze the following note title and content. 
        Generate exactly 3 to 5 concise, single-word or two-word tags that represent the core topics.
        Return the tags as a JSON array of strings. Do not include any other text.
        
        Title: ${title}
        Content: ${content || 'No content provided'}
      `;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 3000),
      );

      const responsePromise = this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);

      // Safely handle undefined text
      const rawText = response.text ?? '';
      const cleanedText = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      if (!cleanedText) {
        this.logger.warn('Gemini returned an empty response.');
        return [];
      }

      const tags = JSON.parse(cleanedText);

      if (Array.isArray(tags)) {
        return tags.map((tag) => tag.toLowerCase());
      }
      return [];
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      this.logger.error(
        `Gemini offline or error, saving note without tags: ${errorMessage}`,
      );
      return [];
    }
  }
}