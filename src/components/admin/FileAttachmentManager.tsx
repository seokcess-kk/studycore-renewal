"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Upload,
  X,
  Loader2,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Download,
  RotateCcw,
} from "lucide-react";
import type { GuideAttachment } from "@/domains/guide/model";
import { downloadWithName } from "@/components/common/AttachmentModal";
import { FormError } from "@/components/common";

interface FileAttachmentManagerProps {
  sectionId?: string;
  value: GuideAttachment[];
  onChange: (attachments: GuideAttachment[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "success" | "error";
  file: File;
}

const BUCKET = "guide-attachments";
const MAX_RETRY = 3;

function getFileType(
  mimeType: string
): GuideAttachment["type"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("powerpoint") ||
    mimeType.includes("presentation")
  )
    return "document";
  return "file";
}

function getFileIcon(type: GuideAttachment["type"]) {
  switch (type) {
    case "image":
      return FileImage;
    case "pdf":
      return FileText;
    case "document":
      return FileSpreadsheet;
    default:
      return File;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FileAttachmentManager({
  sectionId,
  value = [],
  onChange,
  disabled = false,
  maxFiles = 10,
  maxSizeMB = 20,
}: FileAttachmentManagerProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (
      file: File,
      fileId: string,
      retryCount: number = 0
    ): Promise<GuideAttachment | null> => {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const folder = sectionId || "temp";
      const storagePath = `${folder}/${fileId}.${ext}`;

      const updateProgress = (
        progress: number,
        status: UploadingFile["status"] = "uploading"
      ) => {
        setUploading((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress, status } : f
          )
        );
      };

      try {
        updateProgress(20);

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) throw uploadError;

        updateProgress(80);

        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);

        updateProgress(100, "success");

        return {
          id: fileId,
          name: file.name,
          type: getFileType(file.type),
          size: file.size,
          url: data.publicUrl,
        };
      } catch (err) {
        console.error("File upload error:", err);

        if (retryCount < MAX_RETRY) {
          updateProgress(0, "uploading");
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          return uploadFile(file, fileId, retryCount + 1);
        }

        updateProgress(0, "error");
        return null;
      }
    },
    [sectionId]
  );

  const retryUpload = useCallback(
    async (fileId: string) => {
      const failed = uploading.find(
        (f) => f.id === fileId && f.status === "error"
      );
      if (!failed) return;

      setUploading((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "uploading" as const, progress: 0 }
            : f
        )
      );

      const result = await uploadFile(failed.file, fileId, 0);
      if (result) {
        setUploading((prev) => prev.filter((f) => f.id !== fileId));
        onChange([...value, result]);
      }
    },
    [uploading, uploadFile, onChange, value]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);
      const activeCount =
        value.length +
        uploading.filter((u) => u.status !== "error").length;
      const remaining = maxFiles - activeCount;

      if (remaining <= 0) {
        setError(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
        return;
      }

      const filesToUpload = fileArray.slice(0, remaining);
      const oversized = filesToUpload.filter(
        (f) => f.size > maxSizeMB * 1024 * 1024
      );
      if (oversized.length > 0) {
        setError(`${maxSizeMB}MB를 초과하는 파일은 업로드할 수 없습니다.`);
        return;
      }

      const newFiles: UploadingFile[] = filesToUpload.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        progress: 0,
        status: "uploading" as const,
        file,
      }));

      setUploading((prev) => [...prev, ...newFiles]);

      const results = await Promise.all(
        newFiles.map((uf) => uploadFile(uf.file, uf.id, 0))
      );

      const successful: GuideAttachment[] = [];
      const failedIds: string[] = [];

      results.forEach((result, i) => {
        if (result) {
          successful.push(result);
        } else {
          failedIds.push(newFiles[i].id);
        }
      });

      setUploading((prev) => prev.filter((f) => failedIds.includes(f.id)));

      if (successful.length > 0) {
        onChange([...value, ...successful]);
      }

      if (failedIds.length > 0) {
        setError(
          `${failedIds.length}개 파일 업로드 실패. 재시도 버튼을 눌러주세요.`
        );
      }
    },
    [maxFiles, maxSizeMB, value, uploading, uploadFile, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles, disabled]
  );

  const handleRemove = async (attachment: GuideAttachment) => {
    // UI에서 먼저 제거 (Storage 실패해도 JSONB에서는 제거)
    onChange(value.filter((a) => a.id !== attachment.id));

    // Storage 정리 (실패해도 무시 — 고아 파일은 허용)
    try {
      const supabase = createClient();
      const path = attachment.url.split(`${BUCKET}/`)[1];
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
    } catch (err) {
      console.error("Storage 파일 삭제 실패:", err);
    }
  };

  const handleCancelUpload = (fileId: string) => {
    setUploading((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const activeUploading = uploading.filter((u) => u.status !== "error");
  const isMaxReached =
    value.length + activeUploading.length >= maxFiles;

  return (
    <div className="space-y-3">
      {/* 드롭존 */}
      {!isMaxReached && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed p-5 text-center cursor-pointer transition-colors
            ${isDragging ? "border-teal bg-teal/5" : "border-rule hover:border-navy"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
          />
          <Upload size={20} className="mx-auto text-muted mb-1.5" />
          <p className="text-body text-ink">
            클릭하거나 파일을 드래그하세요
          </p>
          <p className="text-small text-muted mt-0.5">
            이미지, PDF, 문서 등 · 최대 {maxFiles}개, 각 {maxSizeMB}MB
          </p>
        </div>
      )}

      {/* 에러 */}
      <FormError message={error ?? undefined} />

      {/* 업로드 중 */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 border border-rule bg-stone"
            >
              <Loader2
                size={16}
                className={`flex-shrink-0 ${
                  file.status === "uploading"
                    ? "animate-spin text-teal"
                    : "text-red-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-body text-ink truncate">{file.name}</p>
                {file.status === "uploading" && (
                  <div className="mt-1 h-1 bg-rule">
                    <div
                      className="h-full bg-teal transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {file.status === "error" ? (
                <button
                  type="button"
                  onClick={() => retryUpload(file.id)}
                  className="text-red-500 hover:text-red-700 cursor-pointer transition-colors duration-200"
                  title="재시도"
                >
                  <RotateCcw size={14} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => handleCancelUpload(file.id)}
                className="text-muted hover:text-ink cursor-pointer transition-colors duration-200"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 첨부파일 목록 */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((attachment) => {
            const Icon = getFileIcon(attachment.type);
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 border border-rule bg-white group"
              >
                {/* 이미지 미리보기 */}
                {attachment.type === "image" ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-10 h-10 object-cover border border-rule flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-stone border border-rule flex-shrink-0">
                    <Icon size={18} className="text-muted" />
                  </div>
                )}

                {/* 파일 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-body text-ink truncate">
                    {attachment.name}
                  </p>
                  <p className="text-small text-muted">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>

                {/* 액션 */}
                {!disabled && (
                  <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => downloadWithName(attachment.url, attachment.name)}
                      className="text-muted hover:text-teal cursor-pointer transition-colors duration-200"
                      title="다운로드"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(attachment)}
                      className="text-muted hover:text-red-500 cursor-pointer transition-colors duration-200"
                      title="삭제"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 카운터 */}
      {(value.length > 0 || uploading.length > 0) && (
        <p className="text-small text-muted text-right">
          {value.length + activeUploading.length} / {maxFiles}
        </p>
      )}
    </div>
  );
}
