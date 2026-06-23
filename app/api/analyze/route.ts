import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; 

const MAX_RESUME_INPUT_LENGTH = 120000;
const MAX_JOB_DESC_INPUT_LENGTH = 50000;
const MAX_RESUME_PROMPT_LENGTH = 30000;
const MAX_JOB_DESC_PROMPT_LENGTH = 8000;
const MIN_RESUME_LENGTH = 100;
const GEMINI_MODELS = (process.env.GEMINI_MODELS || 'gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);
const GEMINI_RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function limitTextForPrompt(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}\n\n[Content shortened for analysis because it was very long.]`;
}

async function callGemini(apiKey: string, systemPrompt: string) {
  let lastResponse: Response | null = null;
  let lastModel = GEMINI_MODELS[0] || 'gemini-2.5-flash';

  for (const model of GEMINI_MODELS) {
    lastModel = model;
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      lastResponse = response;

      if (response.ok || !GEMINI_RETRY_STATUSES.has(response.status)) {
        return { response, model };
      }

      if (attempt < 2) {
        await delay(750 * (attempt + 1));
      }
    }
  }

  if (lastResponse) {
    return { response: lastResponse, model: lastModel };
  }

  throw new Error('Gemini API request failed before receiving a response');
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    const trimmedResume = resumeText.trim();
    if (trimmedResume.length < MIN_RESUME_LENGTH) {
      return NextResponse.json({ error: 'Invalid resume length' }, { status: 400 });
    }

    if (trimmedResume.length > MAX_RESUME_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Resume is too long. Please keep it under ${MAX_RESUME_INPUT_LENGTH.toLocaleString()} characters.` },
        { status: 400 }
      );
    }

    const trimmedJobDescription =
      typeof jobDescription === 'string' ? jobDescription.trim() : '';

    if (trimmedJobDescription.length > MAX_JOB_DESC_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Job description is too long. Please keep it under ${MAX_JOB_DESC_INPUT_LENGTH.toLocaleString()} characters.` },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const resumeForPrompt = limitTextForPrompt(trimmedResume, MAX_RESUME_PROMPT_LENGTH);
    const jobDescriptionForPrompt = limitTextForPrompt(
      trimmedJobDescription,
      MAX_JOB_DESC_PROMPT_LENGTH
    );

    const systemPrompt = `You are an expert ATS resume analyzer. Analyze the resume provided.
${jobDescriptionForPrompt ? 'Score it against the job description.' : 'Score it as a general ATS analysis.'}

RESUME:
${resumeForPrompt}
${jobDescriptionForPrompt ? `JOB DESCRIPTION:\n${jobDescriptionForPrompt}` : ''}

Return ONLY valid JSON matching this exact structure:
{
  "overallScore": 50,
  "detectedRole": "Title",
  "summary": "Brief assessment under 15 words.",
  "scoreBreakdown": {
    "keywordMatch": { "score": 50, "label": "Keyword Match" },
    "formatting": { "score": 50, "label": "ATS Formatting" },
    "experience": { "score": 50, "label": "Experience Quality" },
    "skills": { "score": 50, "label": "Skills Section" },
    "completeness": { "score": 50, "label": "Completeness" }
  },
  "sectionScores": { "summary": 50, "experience": 50, "skills": 50, "education": 50, "contact": 50 },
  "presentKeywords": ["abc"],
  "missingKeywords": ["xyz"],
  "formatIssues": ["issue"],
  "improvements": [{ "type": "warning", "section": "Experience", "issue": "problem", "fix": "solution" }],
  "weakActionVerbs": [{ "found": "led", "replace": "orchestrated" }],
  "strengths": ["strength"],
  "bulletPointRewrites": [
    {
      "originalPhrase": "<the exact weak sentence found in their resume>",
      "suggestedRewrite": "<the high-impact, action-oriented rewritten sentence>",
      "reason": "<why this rewrite is better, e.g., adds metrics or stronger action verbs>"
    }
  ],
  "readability": { "score": 50, "tone": "Professional", "avgSentenceLength": "15 words", "jargonLevel": "Medium" }
}
Keep answers minimal and extremely concise.`;

    // 1. Call the stream endpoint and retry short-lived upstream failures.
    const { response: apiResponse, model } = await callGemini(apiKey, systemPrompt);

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('Gemini API error:', model, apiResponse.status, errorBody);

      return NextResponse.json(
        {
          error:
            apiResponse.status === 503
              ? 'ResumeScore is temporarily unavailable because Gemini is under high demand. Please try again in a minute.'
              : 'Gemini API request failed',
          status: apiResponse.status,
          model,
        },
        { status: apiResponse.status }
      );
    }

    // 2. Read the stream chunks directly to bypass the 10s idle network cap
    const reader = apiResponse.body?.getReader();
    const decoder = new TextDecoder();
    let rawText = '';

    if (!reader) {
      return NextResponse.json({ error: 'Failed to initialize stream reader' }, { status: 500 });
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      rawText += decoder.decode(value, { stream: true });
    }

    // 3. Reconstruct the text chunks. Google stream endpoint returns an array of structural candidate blocks.
    // We clean up the chunks to find our final combined text.
    let cleanJsonText = '';
    try {
      const jsonChunks = JSON.parse(rawText.trim());
      if (Array.isArray(jsonChunks)) {
        for (const chunk of jsonChunks) {
          const textPart = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textPart) cleanJsonText += textPart;
        }
      }
    } catch {
      // Fallback clean regex extraction if the streaming wrapping gets messy
      const matches = [...rawText.matchAll(/"text"\s*:\s*"([\s\S]*?)"/g)];
      cleanJsonText = matches.map(m => m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')).join('');
    }

    // 4. Clean formatting strings up and serve it down to your client application cleanly
    const finalData = JSON.parse(cleanJsonText.trim());
    return NextResponse.json(finalData);

  } catch (error) {
    console.error('API processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
