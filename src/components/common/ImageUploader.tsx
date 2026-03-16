"use client";

import { useState, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon, Loader2, RotateCcw } from "lucide-react";

interface ImageUploaderProps {
  bucket: string;
  folder: string;
  maxFiles?: number;
  maxSizeMB?: number;
  value?: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  previewUrl: string; // 로컬 blob URL
  status: "uploading" | "success" | "error";
  retryCount: number;
  file: File; // 재시도용 원본 파일
}

const MAX_RETRY_COUNT = 3;

export function ImageUploader({
  bucket,
  folder,
  maxFiles = 5,
  maxSizeMB = 1,
  value = [],
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(
    async (file: File): Promise<File> => {
      const options = {
        maxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      return await imageCompression(file, options);
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

        // 이미지 압축
        const compressedFile = await compressImage(file);
        updateProgress(40);

        // 업로드
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: compressedFile.type || `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
          });

        if (uploadError) {
          throw uploadError;
        }

        updateProgress(90);

        // 공개 URL 가져오기
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

        updateProgress(100, "success");

        // blob URL 해제
        URL.revokeObjectURL(previewUrl);

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
    [bucket, folder, compressImage]
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
      const invalidFiles = filesToUpload.filter(
        (file) => !file.type.startsWith("image/")
      );

      if (invalidFiles.length > 0) {
        setError("이미지 파일만 업로드 가능합니다.");
        return;
      }

      // 로컬 미리보기 생성 및 업로드 상태 추가
      const newUploadingFiles: UploadingFile[] = filesToUpload.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        progress: 0,
        previewUrl: URL.createObjectURL(file),
        status: "uploading" as const,
        retryCount: 0,
        file,
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
    [maxFiles, value, uploading, uploadFile, onChange]
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
    if (file) {
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
            accept="image/*"
            multiple
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          <Upload size={24} className="mx-auto text-muted mb-2" />
          <p className="text-[14px] text-ink">
            클릭하거나 이미지를 드래그하세요
          </p>
          <p className="text-[12px] text-muted mt-1">
            최대 {maxFiles}개, 각 {maxSizeMB}MB 이하
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <p className="text-[13px] text-red-600">{error}</p>}

      {/* 업로드 중 (미리보기 포함) */}
      {uploading.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {uploading.map((file) => (
            <div
              key={file.id}
              className="relative aspect-square bg-stone border border-rule overflow-hidden"
            >
              {/* 로컬 미리보기 이미지 */}
              <img
                src={file.previewUrl}
                alt={file.name}
                className={`w-full h-full object-cover ${
                  file.status === "error" ? "opacity-50" : ""
                }`}
              />

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
                  <span className="text-[11px] text-white mt-1">
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
                  <span className="text-[11px] text-white mt-2">재시도</span>
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

      {/* 업로드된 이미지 목록 */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square bg-stone border border-rule overflow-hidden"
            >
              {/* 이미지 */}
              <img
                src={url}
                alt={`업로드 이미지 ${index + 1}`}
                className="w-full h-full object-cover"
              />

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
              <div className="absolute bottom-2 left-2 w-5 h-5 bg-navy text-white text-[10px] font-mono flex items-center justify-center">
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
              <ImageIcon size={20} />
              <span className="text-[11px] mt-1">추가</span>
            </button>
          )}
        </div>
      )}

      {/* 카운터 */}
      <p className="text-[12px] text-muted text-right">
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
