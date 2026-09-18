import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ExportError,
  isSplitPart,
  mergeStoryExports,
  parseExportJson,
  slimExport,
  type StoryExport,
} from "@/lib/export";
import { FolderOpen, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

async function readExportFile(file: File): Promise<StoryExport> {
  const text = await file.text();
  return parseExportJson(text);
}

export function OpenProjectButton({
  onLoaded,
  onError,
  disabled,
}: {
  onLoaded: (data: StoryExport, sourceLabel: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);
  const [pendingPart, setPendingPart] = useState<{
    data: StoryExport;
    fileName: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handlePrimary(file: File) {
    setBusy(true);
    try {
      const data = await readExportFile(file);
      if (isSplitPart(data)) {
        setPendingPart({ data, fileName: file.name });
        return;
      }
      onLoaded(slimExport(data), file.name);
    } catch (error) {
      onError(
        error instanceof ExportError
          ? error.message
          : "Could not open that project file.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleSecond(file: File) {
    if (!pendingPart) return;
    setBusy(true);
    try {
      const second = await readExportFile(file);
      const merged = slimExport(mergeStoryExports(pendingPart.data, second));
      onLoaded(merged, `${pendingPart.fileName} + ${file.name}`);
      setPendingPart(null);
    } catch (error) {
      onError(
        error instanceof ExportError
          ? error.message
          : "Could not merge the two export parts.",
      );
    } finally {
      setBusy(false);
      if (secondInputRef.current) secondInputRef.current.value = "";
    }
  }

  const meta = pendingPart?.data._splitMeta;
  const otherPart = meta?.otherPart ?? (meta?.part === 1 ? 2 : 1);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handlePrimary(file);
        }}
      />
      <input
        ref={secondInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleSecond(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
      >
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <FolderOpen className="size-4" />
        )}
        Open Project
      </Button>
      <Dialog
        open={pendingPart != null}
        onOpenChange={(open) => {
          if (!open && !busy) setPendingPart(null);
        }}
      >
        <DialogContent className="border-white/10 bg-[#1c2433] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>This export is split</DialogTitle>
            <DialogDescription>
              {pendingPart
                ? `${pendingPart.fileName} is part ${meta?.part ?? "?"} of ${meta?.totalParts ?? 2}. Choose part ${otherPart} to reconstruct the full story, or continue with this half only.`
                : "Choose the other half of this Charisma export."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-white/10 bg-transparent">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (!pendingPart) return;
                onLoaded(
                  slimExport(pendingPart.data),
                  `${pendingPart.fileName} (partial)`,
                );
                setPendingPart(null);
              }}
            >
              Continue with this part
            </Button>
            <Button
              type="button"
              onClick={() => secondInputRef.current?.click()}
              disabled={busy}
            >
              Choose part {otherPart}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
