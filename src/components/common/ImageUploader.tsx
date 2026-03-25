"use client";

import { useState, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon, FileText, Loader2, RotateCcw, Paperclip } from "lucide-react";
import { isPdfUrl } from "./AttachmentModal";
import { FormError } from "./FormError";

export interface UploadedFileMeta {
  url: string;
  original_name: string;
  size: number;
  type: string;
}

interface ImageUploaderProps {
  bucket: string;
  folder: string;
  maxFiles?: number;
  maxSizeMB?: number;
  /** 허용 파일 타입. 기본 "image/*". PDF 포함 시 "image/*,.pdf" */
  accept?: string;
  value?: string[];
  onChange: (urls: string[]) => void;
  /** 업로드 성공 시 메타데이터 콜백 (원본 파일명 보존용) */
  onFileUploaded?: (meta: UploadedFileMeta) => void;
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  previewUrl: string; // 로컬 blob URL (이미지) 또는 빈 문자열 (PDF)
  status: "uploading" | "success" | "error";
  retryCount: number;
  file: File; // 재시도용 원본 파일
  isImage: boolean;
}

const MAX_RETRY_COUNT = 3;

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function ImageUploader({
  bucket,
  folder,
  maxFiles = 5,
  maxSizeMB = 1,
  accept = "image/*",
  value = [],
  onChange,
  onFileUploaded,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowsPdf = accept.includes(".pdf");

  const compressImage = useCallback(
    async (file: File): Promise<File> => {
      const options = {
        maxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.8,
      };
      const compressed = await imageCompression(file, options);

      // 압축 후에도 제한 초과 시 추가 압축
      if (compressed.size > maxSizeMB * 1024 * 1024) {
        const retryOptions = {
          maxSizeMB: maxSizeMB * 0.8,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          initialQuality: 0.6,
        };
        return await imageCompression(compressed, retryOptions);
      }

      return compressed;
    },
    [maxSizeMB]
  );

  // 단일 파일 업로드 (재시도 지원)
  const uploadFile = useCallback(
    async (
      file: File,
      fileId: string,
      previewUrl: string,
      retryCount: number = 0
    ): Promise<string | null> => {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${folder}/${fileId}.${fileExt}`;

      // 진행률 업데이트
      const updateProgress = (progress: number, status: UploadingFile["status"] = "uploading") => {
        setUploading((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress, status, retryCount } : f
          )
        );
      };

      try {
        updateProgress(10);

        // 이미지만 압축, PDF는 원본 그대로 업로드
        const fileToUpload = isImageFile(file) ? await compressImage(file) : file;
        updateProgress(40);

        // contentType 결정
        const contentType = isImageFile(file)
          ? fileToUpload.type || `image/${fileExt === "jpg" ? "jpeg" : fileExt}`
          : file.type || "application/octet-stream";

        // 업로드
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, fileToUpload, {
            cacheControl: "3600",
            upsert: false,
            contentType,
          });

        if (uploadError) {
          throw uploadError;
        }

        updateProgress(90);

        // 공개 URL 가져오기
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

        updateProgress(100, "success");

        // blob URL 해제
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        // 메타데이터 콜백 (원본 파일명 보존)
        if (onFileUploaded) {
          onFileUploaded({
            url: data.publicUrl,
            original_name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
          });
        }

        return data.publicUrl;
      } catch (err) {
        console.error("Upload error:", err);

        // 재시도
        if (retryCount < MAX_RETRY_COUNT) {
          updateProgress(0, "uploading");
          // 지수 백오프 (1초, 2초, 4초)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          return uploadFile(file, fileId, previewUrl, retryCount + 1);
        }

        updateProgress(0, "error");
        return null;
      }
    },
    [bucket, folder, compressImage, onFileUploaded]
  );

  // 실패한 파일 수동 재시도
  const retryUpload = useCallback(
    async (fileId: string) => {
      const failedFile = uploading.find((f) => f.id === fileId && f.status === "error");
      if (!failedFile) return;

      setUploading((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "uploading", retryCount: 0, progress: 0 } : f
        )
      );

      const result = await uploadFile(
        failedFile.file,
        fileId,
        failedFile.previewUrl,
        0
      );

      if (result) {
        // 성공 시 상태에서 제거하고 value에 추가
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
      const currentCount = value.length + uploading.filter((u) => u.status !== "error").length;
      const remainingSlots = maxFiles - currentCount;

      if (remainingSlots <= 0) {
        setError(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
        return;
      }

      const filesToUpload = fileArray.slice(0, remainingSlots);

      // 허용 타입 검증
      const allowedTypes = allowsPdf
        ? (file: File) => isImageFile(file) || file.type === "application/pdf"
        : (file: File) => isImageFile(file);

      const invalidFiles = filesToUpload.filter((file) => !allowedTypes(file));

      if (invalidFiles.length > 0) {
        setError(allowsPdf ? "이미지 또는 PDF 파일만 업로드 가능합니다." : "이미지 파일만 업로드 가능합니다.");
        return;
      }

      // 원본 크기 제한 (10MB 초과 시 거부)
      const oversizedFiles = filesToUpload.filter(
        (file) => file.size > 10 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError("10MB를 초과하는 파일은 업로드할 수 없습니다.");
        return;
      }

      // 로컬 미리보기 생성 및 업로드 상태 추가
      const newUploadingFiles: UploadingFile[] = filesToUpload.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        progress: 0,
        previewUrl: isImageFile(file) ? URL.createObjectURL(file) : "",
        status: "uploading" as const,
        retryCount: 0,
        file,
        isImage: isImageFile(file),
      }));

      setUploading((prev) => [...prev, ...newUploadingFiles]);

      // 병렬 업로드
      const uploadPromises = newUploadingFiles.map((uf) =>
        uploadFile(uf.file, uf.id, uf.previewUrl, 0)
      );

      const results = await Promise.all(uploadPromises);

      // 성공한 URL들 수집
      const successfulUrls: string[] = [];
      const failedIds: string[] = [];

      results.forEach((result, index) => {
        if (result) {
          successfulUrls.push(result);
        } else {
          failedIds.push(newUploadingFiles[index].id);
        }
      });

      // 성공한 파일들은 uploading에서 제거
      setUploading((prev) =>
        prev.filter((f) => failedIds.includes(f.id))
      );

      if (successfulUrls.length > 0) {
        onChange([...value, ...successfulUrls]);
      }

      if (failedIds.length > 0) {
        setError(`${failedIds.length}개 파일 업로드 실패. 재시도 버튼을 눌러주세요.`);
      }
    },
    [maxFiles, value, uploading, uploadFile, onChange, allowsPdf]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    // Storage에서 삭제
    const supabase = createClient();
    const path = urlToRemove.split(`${bucket}/`)[1];

    if (path) {
      await supabase.storage.from(bucket).remove([path]);
    }

    // 상태에서 제거
    onChange(value.filter((url) => url !== urlToRemove));
  };

  const handleCancelUpload = (fileId: string) => {
    const file = uploading.find((f) => f.id === fileId);
    if (file && file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    setUploading((prev) => prev.filter((f) => f.id !== fileId));
  };

  const activeUploading = uploading.filter((u) => u.status !== "error");
  const failedUploads = uploading.filter((u) => u.status === "error");
  const isMaxReached = value.length + activeUploading.length >= maxFiles;

  return (
    <div className="space-y-4">
      {/* 드롭존 */}
      {!isMaxReached && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed p-6 text-center cursor-pointer transition-colors
            ${isDragging ? "border-teal bg-teal/5" : "border-rule hover:border-navy"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
            aria-label={allowsPdf ? "이미지 또는 PDF 파일 선택" : "이미지 파일 선택"}
          />

          <Upload size={24} className="mx-auto text-muted mb-2" />
          <p className="text-body text-ink">
            {allowsPdf ? "클릭하거나 파일을 드래그하세요" : "클릭하거나 이미지를 드래그하세요"}
          </p>
          <p className="text-small text-muted mt-1">
            최대 {maxFiles}개
            {allowsPdf
              ? ` (이미지 ${maxSizeMB}MB·PDF 10MB 이하)`
              : `, 각 ${maxSizeMB}MB 이하`}
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      <FormError message={error ?? undefined} />

      {/* 업로드 중 (미리보기 포함) */}
      {uploading.length > 0 && (
        <div role="status" aria-live="polite" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {uploading.map((file) => (
            <div
              key={file.id}
              className="relative aspect-square bg-stone border border-rule overflow-hidden"
            >
              {/* 미리보기: 이미지 또는 PDF 아이콘 */}
              {file.isImage ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className={`w-full h-full object-cover ${
                    file.status === "error" ? "opacity-50" : ""
                  }`}
                />
              ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${
                  file.status === "error" ? "opacity-50" : ""
                }`}>
                  <FileText size={32} className="text-muted" />
                  <span className="text-caption text-muted px-2 text-center truncate w-full">
                    {file.name}
                  </span>
                </div>
              )}

              {/* 진행률 오버레이 */}
              {file.status === "uploading" && (
                <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-white mb-2" />
                  <div className="w-3/4 h-1 bg-white/30">
                    <div
                      className="h-full bg-teal transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span className="text-caption text-white mt-1">
                    {file.progress}%
                    {file.retryCount > 0 && ` (재시도 ${file.retryCount}/${MAX_RETRY_COUNT})`}
                  </span>
                </div>
              )}

              {/* 실패 오버레이 */}
              {file.status === "error" && (
                <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={() => retryUpload(file.id)}
                    className="w-10 h-10 bg-white flex items-center justify-center hover:bg-stone transition-colors"
                  >
                    <RotateCcw size={18} className="text-red-600" />
                  </button>
                  <span className="text-caption text-white mt-2">재시도</span>
                </div>
              )}

              {/* 취소/삭제 버튼 */}
              <button
                type="button"
                onClick={() => handleCancelUpload(file.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-ink/80 text-white flex items-center justify-center hover:bg-ink transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드된 파일 목록 */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square bg-stone border border-rule overflow-hidden"
            >
              {/* 이미지 또는 PDF 아이콘 */}
              {isPdfUrl(url) ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <FileText size={32} className="text-muted" />
                  <span className="text-caption text-muted">PDF</span>
                </div>
              ) : (
                <img
                  src={url}
                  alt={`업로드 파일 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* 삭제 버튼 */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-2 right-2 w-6 h-6 bg-ink/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              )}

              {/* 순서 표시 */}
              <div className="absolute bottom-2 left-2 w-5 h-5 bg-navy text-white text-label font-mono flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}

          {/* 빈 슬롯 표시 */}
          {!isMaxReached && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="aspect-square border-2 border-dashed border-rule flex flex-col items-center justify-center text-muted hover:border-navy hover:text-navy transition-colors disabled:opacity-50"
            >
              {allowsPdf ? <Paperclip size={20} /> : <ImageIcon size={20} />}
              <span className="text-caption mt-1">추가</span>
            </button>
          )}
        </div>
      )}

      {/* 카운터 */}
      <p className="text-small text-muted text-right">
        {value.length + activeUploading.length} / {maxFiles}
        {failedUploads.length > 0 && (
          <span className="text-red-500 ml-2">
            ({failedUploads.length}개 실패)
          </span>
        )}
      </p>
    </div>
  );
}
