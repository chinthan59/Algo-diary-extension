import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export interface SolutionAnalysis {
  approach: string;
  intuition: string;
  time_complexity: string;
  space_complexity: string;
  patterns: string[];
  steps: string[];
  edge_cases: string[];
  alternative_approaches: string[];
  linkedin_caption: string;
}

const SYSTEM_PROMPT = `You are an expert software engineer and technical writer. Given a coding problem solution, analyze it deeply and return a JSON object with this exact structure:
{
"approach": "string — name of the main algorithmic approach (e.g. Dynamic Programming, Two Pointers, BFS)",
"intuition": "string — 2-3 sentences explaining the core insight behind the solution",
"time_complexity": "string — Big O time complexity with brief justification",
"space_complexity": "string — Big O space complexity with brief justification",
"patterns": ["array of pattern tags, e.g. sliding window, hash map, recursion"],
"steps": ["array of strings — numbered steps describing the algorithm"],
"edge_cases": ["array of edge cases handled or worth noting"],
"alternative_approaches": ["array of strings — other valid approaches and their trade-offs"],
"linkedin_caption": "string — an engaging 3-4 sentence LinkedIn post about solving this problem. Mention the approach, what you learned, and end with relevant hashtags like #DSA #LeetCode #CodingInterview"
}
Return ONLY valid JSON. No markdown, no explanation.`;

export async function analyzeSolution(payload: {
  platform: string;
  title: string;
  difficulty?: string;
  language: string;
  runtime: string;
  memory: string;
  code: string;
}): Promise<SolutionAnalysis> {
  const userPrompt = `Platform: ${payload.platform}
Problem: ${payload.title}
Difficulty: ${payload.difficulty || 'Unknown'}
Language: ${payload.language}
Runtime: ${payload.runtime}
Memory: ${payload.memory}

My solution:
${payload.code}`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });

  try {
    const content = completion.choices[0]?.message?.content || '';
    // Extract JSON in case there's any surrounding text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }
    const analysis: SolutionAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Failed to parse Groq response', error);
    throw new Error('Invalid JSON structure returned by Groq');
  }
}
