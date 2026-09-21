import { Check, FileText, Link2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { useContractLens } from "@/components/ContractLensContext";
import { useAuth } from "@/components/AuthContext";
import {
  processContractUpload,
  type ProcessingStage,
} from "@/lib/contractProcessor";
import { PageHeader } from "@/components/MvpUi";
import { supabase } from "@/lib/supabase";

const stages: ProcessingStage[] = [
  "Uploading PDF...",
  "Extracting contract text...",
  "Analyzing contract...",
  "Saving extracted information...",
  "Contract analysis complete.",
];
const maxFileSize = 25 * 1024 * 1024;

export default function UploadContract() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh } = useContractLens();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("Vendor agreement");
  const [related, setRelated] = useState<File[]>([]);
  const [stage, setStage] = useState(-1);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectPdf = (selected: File) => {
    setError(null);
    if (
      selected.type !== "application/pdf" ||
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError(
        "Please choose a PDF file. DOCX files are not supported in this extraction flow yet.",
      );
      return;
    }
    if (selected.size > maxFileSize) {
      setError("This PDF is larger than 25 MB. Please choose a smaller file.");
      return;
    }
    startProcessing(selected);
  };
  const startProcessing = (selected: File) => {
    setFile(selected);
    if (!name) setName(selected.name.replace(/\.[^/.]+$/, ""));
  };
  const processUpload = async () => {
    if (!file || !user) {
      setError("Please sign in before uploading a contract.");
      return;
    }
    setError(null);
    setStage(0);
    try {
      const workspaceResult = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (workspaceResult.error || !workspaceResult.data)
        throw new Error("Workspace not found. Please refresh and try again.");
      const id = await processContractUpload({
        file,
        name: name.trim() || file.name.replace(/\.[^/.]+$/, ""),
        contractType: type,
        userId: user.id,
        workspaceId: workspaceResult.data.id,
        onStage: (next) => setStage(stages.indexOf(next)),
      });
      await refresh();
      navigate(`/contracts/${id}`);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "The contract could not be processed. Please retry.",
      );
      setStage(-1);
    }
  };
  /* Legacy simulated processing removed; real uploads use processUpload above.
    if (!file) return;
    let current = 0;
    setStage(0);
    const timer = window.setInterval(() => {
      current += 1;
      setStage(current);
      if (current === stages.length - 1) {
        window.clearInterval(timer);
        const id = `uploaded-${Date.now()}`;
        addContract({
          id,
          name: name || file.name,
          type,
          parties: "Pending extraction · Your company",
          status: "Processing",
          risk: "Pending",
          effectiveDate: null,
          expiration: null,
          renewal: null,
          icon: (name || "CL").slice(0, 2).toUpperCase(),
          color: "bg-[#e8efff] text-[#526ec4]",
        });
        window.setTimeout(() => navigate(`/contracts/${id}`), 450);
      }
    }, 430);
  }; */
  return (
    <WorkspaceLayout title="Upload contract">
      <PageHeader
        eyebrow="New contract"
        title="Bring an agreement into focus"
        description="Upload a document and ContractLens will preserve its source trail while building searchable intelligence."
      />
      <div className="mx-auto mt-5 grid max-w-[1080px] gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 shadow-[0_5px_18px_rgba(34,52,68,0.025)] md:p-7">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const dropped = event.dataTransfer.files[0];
              if (dropped) selectPdf(dropped);
            }}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition md:p-12 ${dragging ? "border-[#70baa4] bg-[#effaf6]" : "border-[#d7e4e8] bg-[#fbfcfd]"}`}
          >
            <input
              id="contract-file"
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) selectPdf(selected);
              }}
            />
            <label htmlFor="contract-file" className="cursor-pointer">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4f8f0] text-[#3e927b]">
                <UploadCloud className="h-7 w-7" strokeWidth={1.6} />
              </div>
              <h2 className="mt-5 text-[16px] font-bold text-[#304758]">
                {file ? file.name : "Drag & drop your contract"}
              </h2>
              <p className="mt-2 text-[11px] text-[#8b9ba5]">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB ready to analyze`
                  : "or click to browse from your computer"}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <span className="rounded-full bg-[#f0f5f7] px-2.5 py-1 text-[9px] font-bold text-[#83939e]">
                  PDF
                </span>
                <span className="rounded-full bg-[#f0f5f7] px-2.5 py-1 text-[9px] font-bold text-[#83939e]">
                  Page citations
                </span>
              </div>
            </label>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-[11px] font-bold text-[#526575]">
                Contract name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Acme Cloud Services Agreement"
                className="h-10 w-full rounded-xl border border-[#dfe7eb] px-3 text-[11px] outline-none focus:border-[#8bcab7]"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-bold text-[#526575]">
                Contract type
              </span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#dfe7eb] bg-white px-3 text-[11px] outline-none focus:border-[#8bcab7]"
              >
                <option>Vendor agreement</option>
                <option>Customer agreement</option>
                <option>Data processing addendum</option>
                <option>Statement of work</option>
                <option>Master service agreement</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[11px] font-bold text-[#526575]">
              Related documents{" "}
              <span className="font-normal text-[#9aa8b2]">(optional)</span>
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-[#dfe7eb] px-3 py-2">
              <Link2 className="h-4 w-4 text-[#94a5af]" />
              <input
                type="file"
                multiple
                accept="application/pdf,.pdf"
                onChange={(event) =>
                  setRelated(Array.from(event.target.files ?? []))
                }
                className="w-full text-[10px] text-[#83939e]"
              />
            </div>
            {related.length > 0 && (
              <p className="mt-2 text-[10px] text-[#5a8f81]">
                {related.length} related document{related.length > 1 ? "s" : ""}{" "}
                attached
              </p>
            )}
          </label>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-[#fff4f1] p-3 text-[11px] font-medium text-[#b95743]"
            >
              {error}
            </p>
          )}
          <button
            disabled={!file || stage >= 0}
            onClick={processUpload}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#183448] text-[12px] font-bold text-white transition hover:bg-[#244b61] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stage >= 0 ? "Processing contract..." : "Analyze contract"}
            <FileText className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-2xl border border-[#e7edf1] bg-white p-5 shadow-[0_5px_18px_rgba(34,52,68,0.025)] md:p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#63a993]">
            Processing pipeline
          </div>
          <h2 className="mt-2 text-[17px] font-bold tracking-[-0.03em] text-[#304758]">
            From upload to insight.
          </h2>
          <div className="mt-6 space-y-3">
            {stages.map((item, index) => (
              <div
                key={item}
                className={`flex items-center gap-3 rounded-xl p-2.5 transition ${stage === index ? "bg-[#effaf6]" : ""}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${stage > index ? "bg-[#c8f2e4] text-[#277b6b]" : stage === index ? "bg-[#183448] text-white" : "bg-[#f0f4f6] text-[#9aa8b2]"}`}
                >
                  {stage > index ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold ${stage >= index && stage >= 0 ? "text-[#3e776a]" : "text-[#7b8d98]"}`}
                >
                  {item}
                </span>
                {stage === index && (
                  <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-[#64b69f]" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-xl bg-[#f7fafb] p-3 text-[10px] leading-relaxed text-[#82939e]">
            Scanned or image-only PDFs are stopped before analysis because OCR
            is not part of this release.
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
