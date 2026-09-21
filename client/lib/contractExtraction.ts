import { z } from "zod";
import type { ExtractedPdfPage } from "./pdfExtractor";

const sourceSchema = z
  .object({
    page: z.number().int().positive().nullable().optional(),
    section: z.string().nullable().optional(),
    clause: z.string().nullable().optional(),
    text: z.string().nullable().optional(),
  })
  .default({});

const valueSchema = z
  .object({
    value: z.string().nullable().optional(),
    source: sourceSchema.optional(),
  })
  .default({});

export const contractExtractionSchema = z.object({
  contract: z
    .object({
      title: z.string().nullable().optional(),
      reference_id: z.string().nullable().optional(),
      contract_type: z.string().nullable().optional(),
    })
    .default({}),
  parties: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional().default("Other"),
        party_type: z.string().nullable().optional(),
        source: sourceSchema.optional(),
      }),
    )
    .default([]),
  dates: z
    .object({
      effective_date: valueSchema,
      expiration_date: valueSchema,
      initial_term: valueSchema,
    })
    .default({ effective_date: {}, expiration_date: {}, initial_term: {} }),
  renewal: z
    .object({
      type: z.string().nullable().optional(),
      period: z.string().nullable().optional(),
      notice_period: z.string().nullable().optional(),
      conditions: z.string().nullable().optional(),
      source: sourceSchema.optional(),
    })
    .default({}),
  payment_terms: z
    .object({
      amount: z.string().nullable().optional(),
      currency: z.string().nullable().optional(),
      frequency: z.string().nullable().optional(),
      payment_period: z.string().nullable().optional(),
      invoice_timing: z.string().nullable().optional(),
      late_payment_terms: z.string().nullable().optional(),
      source: sourceSchema.optional(),
    })
    .default({}),
  termination: z
    .object({
      for_convenience: z.string().nullable().optional(),
      for_cause: z.string().nullable().optional(),
      notice_period: z.string().nullable().optional(),
      cure_period: z.string().nullable().optional(),
      special_conditions: z.array(z.string()).default([]),
      source: sourceSchema.optional(),
    })
    .default({ special_conditions: [] }),
  service_obligations: z
    .array(
      z.object({
        responsible_party: z.string().optional().default(""),
        obligation: z.string().optional().default(""),
        details: z.string().optional().default(""),
        source: sourceSchema.optional(),
      }),
    )
    .default([]),
  important_clauses: z
    .array(
      z.object({
        category: z.string().optional().default("Other"),
        title: z.string().optional().default("Untitled clause"),
        clause_number: z.string().nullable().optional(),
        content: z.string().optional().default(""),
        requires_review: z.boolean().default(false),
        source: sourceSchema.optional(),
      }),
    )
    .default([]),
  summary: z.string().default(""),
});

export type ContractExtraction = z.infer<typeof contractExtractionSchema>;

const systemPrompt = `You are ContractLens, an AI system for extracting factual information from business contracts. Extract only facts explicitly present in the supplied contract. Never invent or assume information; use null when absent. Preserve exact meaning. Return page numbers, section/clause numbers when available, and short supporting source text. Do not give legal advice or unsupported legal conclusions. Return valid JSON matching the requested schema. requires_review is true only when the wording itself calls for a human review, never merely because a clause exists.`;
const schemaPrompt = `Return exactly this JSON shape: {contract:{title,reference_id,contract_type},parties:[{name,role,party_type,source:{page,section,clause,text}}],dates:{effective_date:{value,source},expiration_date:{value,source},initial_term:{value,source}},renewal:{type,period,notice_period,conditions,source},payment_terms:{amount,currency,frequency,payment_period,invoice_timing,late_payment_terms,source},termination:{for_convenience,for_cause,notice_period,cure_period,special_conditions,source},service_obligations:[{responsible_party,obligation,details,source}],important_clauses:[{category,title,clause_number,content,requires_review,source}],summary}. Important clause categories include Confidentiality, Data Security, Privacy, Intellectual Property, Liability, Indemnification, Insurance, Service Level Agreement, Termination, Renewal, Payment, Governing Law, Dispute Resolution, Force Majeure, Notices. All unknown scalar values must be null.`;

function chunks(pages: ExtractedPdfPage[], maxCharacters = 85000) {
  const result: ExtractedPdfPage[][] = [];
  let current: ExtractedPdfPage[] = [];
  let length = 0;
  for (const page of pages) {
    const pageLength = page.text.length + 20;
    if (current.length && length + pageLength > maxCharacters) {
      result.push(current);
      current = [];
      length = 0;
    }
    current.push(page);
    length += pageLength;
  }
  if (current.length) result.push(current);
  return result;
}

async function requestExtraction(
  pages: ExtractedPdfPage[],
): Promise<ContractExtraction> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  // Intentional hackathon trade-off: this dedicated Groq key is exposed to the browser bundle. Rotate it after the demo.
  if (!apiKey)
    throw new Error(
      "Contract analysis is not configured. Add VITE_GROQ_API_KEY and restart the app.",
    );
  const pageText = pages
    .map((page) => `Page ${page.pageNumber}:\n${page.text}`)
    .join("\n\n");
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      model: "openai/gpt-oss-120b",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `${schemaPrompt}\n\nContract pages:\n${pageText}`,
          },
        ],
      }),
    },
  );
  if (!response.ok) {
    if (response.status === 429)
      throw new Error(
        "Groq is rate-limiting analysis. Please wait a moment and retry.",
      );
    throw new Error("Contract analysis could not be completed. Please retry.");
  }
  const body = await response.json();
  try {
    return contractExtractionSchema.parse(
      JSON.parse(body.choices?.[0]?.message?.content ?? ""),
    );
  } catch {
    throw new Error(
      "Contract analysis returned an invalid response. Please retry.",
    );
  }
}

const first = <T extends { value?: string | null }>(items: T[]) =>
  items.find((item) => item?.value)?.value ?? null;

function merge(results: ContractExtraction[]): ContractExtraction {
  const base = results[0];
  if (!base) throw new Error("No contract text was available for analysis.");
  const parties = Array.from(
    new Map(
      results
        .flatMap((item) => item.parties)
        .filter((party) => party.name)
        .map((party) => [`${party.name}|${party.role}`, party]),
    ).values(),
  );
  const importantClauses = Array.from(
    new Map(
      results
        .flatMap((item) => item.important_clauses)
        .map((clause) => [
          `${clause.source?.page}|${clause.clause_number}|${clause.title}`,
          clause,
        ]),
    ).values(),
  );
  return {
    ...base,
    contract: {
      title:
        first(results.map((item) => ({ value: item.contract.title }))) ?? null,
      reference_id:
        first(results.map((item) => ({ value: item.contract.reference_id }))) ??
        null,
      contract_type:
        first(
          results.map((item) => ({ value: item.contract.contract_type })),
        ) ?? null,
    },
    parties,
    important_clauses: importantClauses,
    service_obligations: results.flatMap((item) => item.service_obligations),
    summary: results
      .map((item) => item.summary)
      .filter(Boolean)
      .join("\n\n"),
  };
}

export async function extractContract(
  pages: ExtractedPdfPage[],
): Promise<ContractExtraction> {
  const results: ContractExtraction[] = [];
  for (const chunk of chunks(pages))
    results.push(await requestExtraction(chunk));
  return merge(results);
}

export function parseContractDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf())
    ? null
    : parsed.toISOString().slice(0, 10);
}
