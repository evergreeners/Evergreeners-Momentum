
import { GoogleGenAI, Type } from "@google/genai";
import { RepoAnalysis, ImprovementSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export class GeminiService {
  static async analyzeRepo(
    repoName: string, 
    fileTree: string[], 
    readmeContent?: string
  ): Promise<RepoAnalysis> {
    const prompt = `
      Analyze the following repository structure and provide a health report.
      Repository: ${repoName}
      Files: ${fileTree.join(', ')}
      README content preview: ${readmeContent?.substring(0, 1000) || 'None found'}

      Return a JSON object representing the repo health.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER, description: 'Score from 0 to 100' },
            completeness: {
              type: Type.OBJECT,
              properties: {
                readme: { type: Type.BOOLEAN },
                contributing: { type: Type.BOOLEAN },
                license: { type: Type.BOOLEAN },
                security: { type: Type.BOOLEAN },
                changelog: { type: Type.BOOLEAN },
                codeOfConduct: { type: Type.BOOLEAN }
              }
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                framework: { type: Type.STRING },
                packageManager: { type: Type.STRING },
                hasTests: { type: Type.BOOLEAN },
                todoCount: { type: Type.NUMBER }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw e;
    }
  }

  static async generateSuggestions(analysis: RepoAnalysis): Promise<ImprovementSuggestion[]> {
    const prompt = `
      Based on this repository analysis: ${JSON.stringify(analysis)}, 
      suggest 3 micro-improvements that a developer can do in under 20 minutes to improve the repo health.
      These must be real, actionable tasks like adding a specific section to a README or creating a missing template.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              estimatedTime: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  }

  static async generateMarkdown(
    fileType: string, 
    repoInfo: string, 
    context: string
  ): Promise<string> {
    const prompt = `
      Generate a professional ${fileType} for a GitHub repository.
      Repository context: ${repoInfo}
      Additional details: ${context}
      Ensure it follows best practices and is highly detailed.
      Output ONLY the markdown content.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || '';
  }
}
