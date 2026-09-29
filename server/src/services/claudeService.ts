import Anthropic from '@anthropic-ai/sdk';
import { IDocChunk } from '../models/Document';
import { IFact, SummaryModeType } from '../models/Summary';

// Initialize Anthropic Client conditionally
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey && apiKey !== 'your_anthropic_api_key_here' 
  ? new Anthropic({ apiKey }) 
  : null;

export interface GeneratedSummaryResult {
  facts: IFact[];
  mode: SummaryModeType;
  antiHallucinationVerified: boolean;
  totalFactsFound: number;
  rejectedFactsCount: number;
}

export async function generateDocumentSummary(
  chunks: IDocChunk[],
  mode: SummaryModeType = 'detailed'
): Promise<GeneratedSummaryResult> {
  const validChunkIdSet = new Set(chunks.map(c => c.chunkId));
  
  if (anthropic) {
    try {
      const chunkPromptString = JSON.stringify(
        chunks.map(c => ({
          chunkId: c.chunkId,
          page: c.page,
          text: c.text
        })),
        null,
        2
      );

      const promptModeGuidance = getModeGuidance(mode);

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for high factual recall accuracy
        system: `You are ClearClaim AI, a meticulous legal and insurance document intelligence analyst.
Your task is to analyze document chunks and extract key verifiable factual statements.

${promptModeGuidance}

STRICT RULE & OUTPUT FORMAT:
You MUST respond ONLY with a raw valid JSON object matching this schema. Do not include markdown codeblocks (no \`\`\`json), no introductory text, no conversational prose:

{
  "facts": [
    {
      "statement": "Clear factual statement in natural plain English",
      "sourceChunkId": "exact_chunkId_string_from_provided_chunks",
      "category": "coverage" | "penalty" | "eligibility" | "renewal" | "liability" | "general",
      "riskLevel": "none" | "low" | "high",
      "riskExplanation": "Optional brief 1-sentence explanation if riskLevel is low or high"
    }
  ]
}

CRITICAL ANTI-HALLUCINATION REQUIREMENT:
- Only include a fact if you can cite an exact sourceChunkId containing that information.
- Never fabricate a chunkId.
- If uncertain about the exact chunkId for a statement, omit the fact entirely rather than guess.`,
        messages: [
          {
            role: 'user',
            content: `Document Chunks:\n${chunkPromptString}`
          }
        ]
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = parseAndValidateJsonResponse(responseText);

      return verifyFactsAgainstChunks(parsed.facts || [], validChunkIdSet, mode);
    } catch (error) {
      console.error('Claude API call failed, using intelligent analyzer fallback:', error);
      return generateFallbackSummary(chunks, mode, validChunkIdSet);
    }
  }

  // Fallback engine if no Anthropic API key is configured
  return generateFallbackSummary(chunks, mode, validChunkIdSet);
}

export async function answerDocumentQuestion(
  chunks: IDocChunk[],
  question: string
): Promise<{ answer: string; sourceChunkIds: string[] }> {
  const validChunkIdSet = new Set(chunks.map(c => c.chunkId));

  if (anthropic) {
    try {
      const chunkPromptString = JSON.stringify(
        chunks.map(c => ({
          chunkId: c.chunkId,
          page: c.page,
          text: c.text
        })),
        null,
        2
      );

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1500,
        temperature: 0.1,
        system: `You are ClearClaim AI. Answer the user's question using ONLY the provided document chunks.
You MUST output your response as raw JSON matching this format:

{
  "answer": "Direct, clear answer to the user's question.",
  "sourceChunkIds": ["chunkId1", "chunkId2"]
}

Rules:
- Include sourceChunkIds ONLY if they directly support your answer.
- Never invent chunkIds.`,
        messages: [
          {
            role: 'user',
            content: `Question: "${question}"\n\nDocument Chunks:\n${chunkPromptString}`
          }
        ]
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = parseAndValidateJsonResponse(text);
      const verifiedChunkIds = (parsed.sourceChunkIds || []).filter((id: string) => validChunkIdSet.has(id));

      return {
        answer: parsed.answer || "Based on the document, I could not find a conclusive answer.",
        sourceChunkIds: verifiedChunkIds
      };
    } catch (err) {
      console.error('Claude Q&A Error:', err);
    }
  }

  // Intelligent fallback for Q&A matching
  const matchingChunks = chunks.filter(c => {
    const keywords = question.toLowerCase().split(' ').filter(w => w.length > 3);
    return keywords.some(kw => c.text.toLowerCase().includes(kw));
  });

  const selectedChunks = matchingChunks.slice(0, 3);
  const chunkIds = selectedChunks.map(c => c.chunkId);

  if (selectedChunks.length > 0) {
    const excerpt = selectedChunks[0].text.substring(0, 200);
    return {
      answer: `Based on section ${selectedChunks[0].chunkId} (Page ${selectedChunks[0].page}): "${excerpt}..."`,
      sourceChunkIds: chunkIds
    };
  }

  return {
    answer: "No specific section matching your question was found in the uploaded document text.",
    sourceChunkIds: chunks.length > 0 ? [chunks[0].chunkId] : []
  };
}

// Verification function (Step 4 of Anti-Hallucination mechanism)
function verifyFactsAgainstChunks(
  facts: IFact[],
  validChunkIdSet: Set<string>,
  mode: SummaryModeType
): GeneratedSummaryResult {
  const total = facts.length;
  const verifiedFacts: IFact[] = [];
  let rejected = 0;

  for (const fact of facts) {
    if (validChunkIdSet.has(fact.sourceChunkId)) {
      fact.verified = true;
      verifiedFacts.push(fact);
    } else {
      rejected++;
      console.warn(`[Anti-Hallucination] Rejected fact with invalid chunk reference: ${fact.sourceChunkId}`);
    }
  }

  return {
    facts: verifiedFacts,
    mode,
    antiHallucinationVerified: true,
    totalFactsFound: total,
    rejectedFactsCount: rejected
  };
}

function getModeGuidance(mode: SummaryModeType): string {
  switch (mode) {
    case 'short':
      return 'Focus on extracting 4-6 essential high-level key takeaways.';
    case 'bullet':
      return 'Format statements as concise single-sentence bullet points covering main obligations, coverage, and limits.';
    case 'timeline':
      return 'Focus on chronological milestones, effective dates, notice periods, claim deadlines, and renewal terms.';
    case 'detailed':
    default:
      return 'Extract a comprehensive list of legal and financial obligations, coverage limits, penalties, eligibility criteria, and liability clauses.';
  }
}

function parseAndValidateJsonResponse(text: string): any {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt regex extraction
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        console.error('Failed to parse JSON match:', err);
      }
    }
    return { facts: [] };
  }
}

// Fallback legal document analyzer when Anthropic API key is not present
function generateFallbackSummary(
  chunks: IDocChunk[],
  mode: SummaryModeType,
  validChunkIdSet: Set<string>
): GeneratedSummaryResult {
  const facts: IFact[] = [];

  chunks.forEach((chunk, index) => {
    const text = chunk.text;
    const lower = text.toLowerCase();

    let category: IFact['category'] = 'general';
    let riskLevel: IFact['riskLevel'] = 'none';
    let riskExplanation: string | undefined;

    if (lower.includes('penalty') || lower.includes('cancel') || lower.includes('forfeit') || lower.includes('termination fee')) {
      category = 'penalty';
      riskLevel = lower.includes('forfeit') || lower.includes('fee') || lower.includes('100%') ? 'high' : 'low';
      riskExplanation = 'Contains penalty or fee forfeiture terms upon cancellation or default.';
    } else if (lower.includes('cover') || lower.includes('reimbur') || lower.includes('max') || lower.includes('benefit')) {
      category = 'coverage';
      riskLevel = lower.includes('exclude') || lower.includes('limit') ? 'low' : 'none';
    } else if (lower.includes('liab') || lower.includes('indemni') || lower.includes('damage') || lower.includes('hold harmless')) {
      category = 'liability';
      riskLevel = 'high';
      riskExplanation = 'Imposes liability or indemnification responsibility on the policyholder/party.';
    } else if (lower.includes('renew') || lower.includes('expire') || lower.includes('term') || lower.includes('automatic')) {
      category = 'renewal';
      riskLevel = lower.includes('automatic') ? 'high' : 'low';
      riskExplanation = 'Auto-renewal terms require explicit notice prior to contract end.';
    } else if (lower.includes('eligible') || lower.includes('require') || lower.includes('must') || lower.includes('condition')) {
      category = 'eligibility';
    }

    // Clean up summary statement
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
    const primarySentence = sentences[0] || text.substring(0, 150);

    facts.push({
      statement: primarySentence.replace(/[\n\r]+/g, ' ').trim(),
      sourceChunkId: chunk.chunkId,
      category,
      riskLevel,
      riskExplanation,
      verified: true
    });
  });

  // Limit facts based on mode
  let finalFacts = facts;
  if (mode === 'short') {
    finalFacts = facts.slice(0, 5);
  } else if (mode === 'timeline') {
    finalFacts = facts.filter(f => f.category === 'renewal' || f.statement.match(/\d{4}|\bday\b|\bmonth\b|\bperiod\b/i)).slice(0, 8);
    if (finalFacts.length === 0) finalFacts = facts.slice(0, 6);
  }

  return verifyFactsAgainstChunks(finalFacts, validChunkIdSet, mode);
}
