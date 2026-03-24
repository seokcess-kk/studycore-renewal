"use client";

import { useEffect } from "react";
import { X, ExternalLink, FileText } from "lucide-react";

interface AttachmentModalProps {
  url: string;
  onClose: () => void;
}

function isPdfUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname;
    return pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return url.toLowerCase().endsWith(".pdf");
  }
}

export function AttachmentModal({ url, onClose }: AttachmentModalProps) {
  const isPdf = isPdfUrl(url);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // 배경 스크롤 방지
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 닫기 버튼 */}
      <button
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
        onClick={onClose}
        aria-label="닫기"
      >
        <X size={20} />
      </button>

      {isPdf ? (
        <div
          className="w-full max-w-4xl h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* PDF 상단 바 */}
          <div className="flex items-center justify-between bg-white/10 px-4 py-2 mb-2">
            <div className="flex items-center gap-2 text-white/80">
              <FileText size={16} />
              <span className="text-body">PDF 문서</span>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-secondary text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              새 탭에서 열기
            </a>
          </div>
          {/* PDF iframe */}
          <iframe
            src={url}
            className="flex-1 w-full bg-white"
            title="PDF 문서"
          />
        </div>
      ) : (
        <img
          src={url}
          alt="확대 이미지"
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}

/** URL이 이미지인지 판별 (PDF가 아니면 이미지로 간주) */
export function isImageUrl(url: string): boolean {
  return !isPdfUrl(url);
}

export { isPdfUrl };
