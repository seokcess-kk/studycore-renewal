"use client";

import { useState, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { Camera, Loader2, User, X } from "lucide-react";

interface AvatarUploaderProps {
  userId: string;
  currentUrl?: string | null;
  onUpload: (url: string | null) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AvatarUploader({
  userId,
  currentUrl,
  onUpload,
  disabled = false,
  size = "md",
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  // 이미지 압축
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 512,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  // 파일 업로드
  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      setProgress(0);

      // 유효성 검사
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드 가능합니다.");
        setIsUploading(false);
        return;
      }

      // 로컬 미리보기
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      try {
        const supabase = createClient();
        setProgress(10);

        // 이미지 압축
        const compressedFile = await compressImage(file);
        setProgress(30);

        // 기존 이미지 삭제
        if (currentUrl) {
          const oldPath = currentUrl.split("avatars/")[1];
          if (oldPath) {
            await supabase.storage.from("avatars").remove([oldPath]);
          }
        }
        setProgress(50);

        // 새 이미지 업로드
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }
        setProgress(80);

        // 공개 URL 가져오기
        const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
        setProgress(100);

        // blob URL 해제
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);

        // 콜백 호출
        onUpload(data.publicUrl);
      } catch (err) {
        console.error("Avatar upload error:", err);
        setError("업로드에 실패했습니다. 다시 시도해주세요.");
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [userId, currentUrl, onUpload]
  );

  // 파일 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // 이미지 삭제
  const handleRemove = async () => {
    if (!currentUrl || disabled) return;

    try {
      const supabase = createClient();
      const path = currentUrl.split("avatars/")[1];

      if (path) {
        await supabase.storage.from("avatars").remove([path]);
      }

      onUpload(null);
    } catch (err) {
      console.error("Avatar delete error:", err);
      setError("삭제에 실패했습니다.");
    }
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 아바타 영역 */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} relative overflow-hidden bg-stone border-2 border-rule`}
          style={{ borderRadius: "50%" }}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={iconSizes[size]} className="text-muted" />
            </div>
          )}

          {/* 업로드 중 오버레이 */}
          {isUploading && (
            <div
              className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center"
              style={{ borderRadius: "50%" }}
            >
              <Loader2 size={20} className="animate-spin text-white" />
              <span className="text-label text-white mt-1">{progress}%</span>
            </div>
          )}
        </div>

        {/* 삭제 버튼 */}
        {currentUrl && !isUploading && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            style={{ borderRadius: "50%" }}
          >
            <X size={12} />
          </button>
        )}

        {/* 업로드 버튼 */}
        {!isUploading && !disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-navy text-white flex items-center justify-center hover:bg-navy-d transition-colors"
            style={{ borderRadius: "50%" }}
          >
            <Camera size={14} />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-small text-red-500 text-center">{error}</p>}

      {/* 안내 문구 */}
      <p className="text-caption text-muted text-center">
        JPG, PNG, WebP (최대 2MB)
      </p>
    </div>
  );
}
