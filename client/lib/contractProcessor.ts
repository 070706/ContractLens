import { supabase } from "./supabase";
import {
  extractContract,
  parseContractDate,
  type ContractExtraction,
} from "./contractExtraction";
import { extractPdfText } from "./pdfExtractor";

export type ProcessingStage =
  | "Uploading PDF..."
  | "Extracting contract text..."
  | "Analyzing contract..."
  | "Saving extracted information..."
  | "Contract analysis complete.";

type ProcessInput = {
  file: File;
  name: string;
  contractType: string;
  userId: string;
  workspaceId: string;
  onStage: (stage: ProcessingStage) => void;
};

const riskForClause = (review: boolean): "Low" | "Medium" | "High" =>
  review ? "High" : "Low";

export async function processContractUpload({
  file,
  name,
  contractType,
  userId,
  workspaceId,
  onStage,
}: ProcessInput) {
  onStage("Uploading PDF...");
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert({
      workspace_id: workspaceId,
      name,
      contract_type: contractType,
      parties: "Pending extraction",
      status: "Processing",
      risk: "Pending",
      icon: name.slice(0, 2).toUpperCase() || "CL",
      color_class: "bg-[#e8efff] text-[#526ec4]",
    })
    .select()
    .single();
  if (contractError || !contract)
    throw new Error("We couldn't create the contract record. Please retry.");

  const documentId = crypto.randomUUID();
  const storagePath = `contracts/${userId}/${contract.id}/${documentId}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("contract-documents")
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (uploadError)
    throw new Error(
      "We couldn't upload the PDF. Please check storage setup and retry.",
    );

  const { error: documentError } = await supabase
    .from("contract_documents")
    .insert({
      id: documentId,
      contract_id: contract.id,
      workspace_id: workspaceId,
      user_id: userId,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || "application/pdf",
      file_size: file.size,
      processing_status: "EXTRACTING",
    });
  if (documentError)
    throw new Error(
      "The PDF uploaded, but its document record could not be saved. Please retry.",
    );

  try {
    onStage("Extracting contract text...");
    const pdf = await extractPdfText(file);
    await supabase
      .from("contract_documents")
      .update({ page_count: pdf.pageCount, processing_status: "ANALYZING" })
      .eq("id", documentId);
    onStage("Analyzing contract...");
    const extraction = await extractContract(pdf.pages);
    onStage("Saving extracted information...");
    await saveExtraction({
      contractId: contract.id,
      documentId,
      workspaceId,
      extraction,
      fallbackName: name,
      fallbackType: contractType,
    });
    await supabase
      .from("contract_documents")
      .update({
        processing_status: "COMPLETED",
        processed_at: new Date().toISOString(),
      })
      .eq("id", documentId);
    onStage("Contract analysis complete.");
    return contract.id;
  } catch (error) {
    await supabase
      .from("contract_documents")
      .update({
        processing_status: "FAILED",
        error_message:
          error instanceof Error ? error.message : "Processing failed",
      })
      .eq("id", documentId);
    await supabase
      .from("contracts")
      .update({ status: "Processing" })
      .eq("id", contract.id);
    throw error;
  }
}

async function saveExtraction({
  contractId,
  documentId,
  workspaceId,
  extraction,
  fallbackName,
  fallbackType,
}: {
  contractId: string;
  documentId: string;
  workspaceId: string;
  extraction: ContractExtraction;
  fallbackName: string;
  fallbackType: string;
}) {
  const parties =
    extraction.parties
      .map((party) => party.name)
      .filter(Boolean)
      .join(" · ") || "Not specified";
  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      name: extraction.contract.title || fallbackName,
      contract_type: extraction.contract.contract_type || fallbackType,
      parties,
      status: "Active",
      risk: extraction.important_clauses.some(
        (clause) => clause.requires_review,
      )
        ? "High"
        : "Low",
      effective_date: parseContractDate(extraction.dates.effective_date.value),
      expiration_date: parseContractDate(
        extraction.dates.expiration_date.value,
      ),
      renewal_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId);
  if (updateError)
    throw new Error("We couldn't save the contract overview. Please retry.");

  const { error: extractionError } = await supabase
    .from("contract_extractions")
    .upsert(
      {
        contract_id: contractId,
        document_id: documentId,
        workspace_id: workspaceId,
        data: extraction,
      },
      { onConflict: "document_id" },
    );
  if (extractionError)
    throw new Error(
      "We couldn't save the extracted contract information. Please retry.",
    );

  const { error: deleteError } = await supabase
    .from("contract_clauses")
    .delete()
    .eq("contract_id", contractId);
  if (deleteError)
    throw new Error(
      "We couldn't replace the prior clause extraction. Please retry.",
    );
  const clauses = extraction.important_clauses
    .filter((clause) => clause.content || clause.title)
    .map((clause, index) => ({
      contract_id: contractId,
      clause_number:
        clause.clause_number ||
        clause.source?.clause ||
        `Extracted ${index + 1}`,
      title: clause.title,
      category: clause.category,
      risk: riskForClause(clause.requires_review),
      page_number: clause.source?.page ?? null,
      source_text: clause.source?.text || clause.content,
      human_review_required: clause.requires_review,
    }));
  if (clauses.length) {
    const { error: clausesError } = await supabase
      .from("contract_clauses")
      .insert(clauses);
    if (clausesError)
      throw new Error("We couldn't save the extracted clauses. Please retry.");
  }
  await supabase
    .from("activities")
    .insert({
      workspace_id: workspaceId,
      action: "Contract analyzed",
      detail: "Contract extraction completed",
      icon: "sparkles",
    });
}
