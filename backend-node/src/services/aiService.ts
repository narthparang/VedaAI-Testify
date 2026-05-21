import axios from 'axios';
import { IQuestionType } from '../models/Assignment';
import { ISection } from '../models/GeneratedPaper';

interface PaperInput {
  subject: string;
  className: string;
  schoolName: string;
  questionTypes: IQuestionType[];
  additionalInstructions: string;
  sourceText: string;
}

interface PaperOutput {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: ISection[];
}

const SECTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    mcq: 'Multiple Choice Questions',
    short: 'Short Answer Questions',
    diagram: 'Diagram/Graph-Based Questions',
    numerical: 'Numerical Problems',
    long: 'Long Answer Questions',
  };
  return map[type] || type;
}

function calculateTimeAllowed(totalMarks: number): string {
  const minutes = Math.max(30, Math.ceil(totalMarks * 1.5));
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} hour${h > 1 ? 's' : ''} ${m} minutes` : `${h} hour${h > 1 ? 's' : ''}`;
  }
  return `${minutes} minutes`;
}

function cleanJSON(raw: string): string {
  return raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
}

function buildPrompt(input: PaperInput): string {
  const totalMarks = input.questionTypes.reduce(
    (sum, qt) => sum + qt.count * qt.marksPerQuestion,
    0
  );
  const totalQuestions = input.questionTypes.reduce((sum, qt) => sum + qt.count, 0);

  const sections = input.questionTypes
    .map((qt, i) => `Section ${SECTION_LABELS[i]}: ${qt.count} ${typeLabel(qt.type)}, ${qt.marksPerQuestion} mark(s) each`)
    .join('\n');

  return `You are an expert question paper generator. Generate a structured exam question paper as a JSON object.

School: ${input.schoolName || 'Delhi Public School'}
Subject: ${input.subject || 'General Science'}
Class: ${input.className || 'Class 8'}
Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}
Time: ${calculateTimeAllowed(totalMarks)}
${input.additionalInstructions ? `Instructions: ${input.additionalInstructions}` : ''}
${input.sourceText ? `Source material:\n${input.sourceText.substring(0, 2000)}` : ''}

Sections required:
${sections}

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "schoolName": "${input.schoolName || 'Delhi Public School'}",
  "subject": "${input.subject || 'General Science'}",
  "className": "${input.className || 'Class 8'}",
  "timeAllowed": "${calculateTimeAllowed(totalMarks)}",
  "maxMarks": ${totalMarks},
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions.",
      "questions": [
        {
          "text": "Question text",
          "difficulty": "easy",
          "marks": 1,
          "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
          "answer": "Correct answer explanation"
        }
      ]
    }
  ]
}

Rules:
- Generate EXACTLY the number of questions per section as specified
- difficulty must be one of: "easy", "moderate", "hard", "challenging"
- MCQ sections: include "options" array with 4 items (A./B./C./D. prefixed)
- Non-MCQ sections: omit "options" field
- Return ONLY valid JSON`;
}

// Recursively find an array that looks like exam sections
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findSections(obj: any, depth = 0): any[] | null {
  if (!obj || typeof obj !== 'object' || depth > 4) return null;
  if (Array.isArray(obj.sections)) return obj.sections;
  for (const val of Object.values(obj)) {
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0] as Record<string, unknown>;
      if (first && typeof first === 'object' && ('questions' in first || 'title' in first)) {
        return val;
      }
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const found = findSections(val, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function parseResponse(raw: string): PaperOutput {
  const cleaned = cleanJSON(raw);
  console.log('Full Groq response:\n', cleaned);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned invalid JSON — could not extract object');
    parsed = JSON.parse(match[0]);
  }

  console.log('Top-level keys:', Object.keys(parsed));

  const sections = findSections(parsed);
  if (!sections) {
    throw new Error(`AI response is missing sections array. Keys found: ${Object.keys(parsed).join(', ')}`);
  }

  return {
    schoolName: parsed.schoolName || parsed.school_name || parsed.school || '',
    subject: parsed.subject || '',
    className: parsed.className || parsed.class_name || parsed.class || '',
    timeAllowed: parsed.timeAllowed || parsed.time_allowed || parsed.duration || '',
    maxMarks: parsed.maxMarks || parsed.max_marks || parsed.total_marks || 0,
    sections,
  };
}

// ── Groq (primary — free, fast, great JSON output) ────────────────────────────

async function generateWithGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert question paper generator. You MUST respond with valid JSON only — no markdown, no explanation, no extra text. Just the raw JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60_000,
    }
  );

  const content = response.data.choices[0].message.content as string;
  console.log('Groq raw response (first 300 chars):', content.substring(0, 300));
  return content;
}

// ── Gemini (fallback) ─────────────────────────────────────────────────────────

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);

  const models = ['gemini-pro', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.0-pro'];

  for (const modelName of models) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      });
      return result.response.text();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('not found') || msg.includes('404') || msg.includes('not supported')) {
        console.warn(`Gemini model ${modelName} unavailable, trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('All Gemini models unavailable');
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function generatePaper(input: PaperInput): Promise<PaperOutput> {
  const prompt = buildPrompt(input);
  const errors: string[] = [];

  console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

  // 1. Groq (primary)
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('Using Groq for generation...');
      const text = await generateWithGroq(prompt);
      console.log('✓ Groq generation succeeded');
      return parseResponse(text);
    } catch (err) {
      const msg = (err as Error).message;
      console.error('✗ Groq failed:', msg);
      errors.push(`Groq: ${msg}`);
    }
  } else {
    errors.push('Groq: GROQ_API_KEY not set');
  }

  // 2. Gemini (fallback)
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('Trying Gemini as fallback...');
      const text = await generateWithGemini(prompt);
      console.log('✓ Gemini generation succeeded');
      return parseResponse(text);
    } catch (err) {
      const msg = (err as Error).message;
      console.error('✗ Gemini failed:', msg);
      errors.push(`Gemini: ${msg}`);
    }
  } else {
    errors.push('Gemini: GEMINI_API_KEY not set');
  }

  throw new Error(`All AI providers failed:\n${errors.join('\n')}`);
}
