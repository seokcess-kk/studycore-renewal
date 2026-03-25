"use client";

import { useEffect } from "react";
import { X, ExternalLink, FileText, Download } from "lucide-react";

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

/** URL에서 파일명 추출 */
function getFileName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/");
    const last = segments[segments.length - 1];
    return decodeURIComponent(last);
  } catch {
    return "파일";
  }
}

/** Blob fetch → 원본 파일명으로 다운로드 */
async function downloadWithName(url: string, fileName: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("download failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    // fallback: 새 탭에서 열기
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/**
 * 첨부파일 인라인 목록 — 이미지는 작은 썸네일, 파일은 한 줄 리스트
 * 질문/답변 등에서 공통 사용
 */
interface AttachmentListProps {
  urls: string[];
  onSelect: (url: string) => void;
  /** 테두리 색상 변형 (답변 카드용) */
  variant?: "default" | "answer";
}

export function AttachmentList({ urls, onSelect, variant = "default" }: AttachmentListProps) {
  const imageUrls = urls.filter(isImageUrl);
  const fileUrls = urls.filter(isPdfUrl);
  const borderClass = variant === "answer" ? "border-teal/20" : "border-rule";

  return (
    <div className="space-y-2">
      {/* 이미지 썸네일 — 작은 가로 나열 */}
      {imageUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {imageUrls.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(url)}
              className={`w-16 h-16 overflow-hidden border ${borderClass} bg-stone hover:opacity-80 transition-opacity cursor-pointer`}
            >
              <img
                src={url}
                alt="첨부 이미지"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* 파일(PDF 등) — 한 줄 리스트 */}
      {fileUrls.length > 0 && (
        <div className="space-y-1">
          {fileUrls.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(url)}
              className={`flex items-center gap-2 w-full text-left px-3 py-1.5 border ${borderClass} bg-stone/50 hover:border-navy transition-colors cursor-pointer`}
            >
              <FileText size={14} className="text-muted flex-shrink-0" />
              <span className="text-small text-ink truncate">{getFileName(url)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 메타데이터 기반 첨부파일 목록 — 공지사항, 프로그램 등 (file_name, file_url, file_type, file_size)
 */
interface MetaAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

interface MetaAttachmentListProps {
  attachments: MetaAttachment[];
  /** 이미지/파일 클릭 시 모달 오픈 콜백 (미전달 시 새 탭) */
  onSelect?: (url: string) => void;
}

export function MetaAttachmentList({ attachments, onSelect }: MetaAttachmentListProps) {
  const imageAtts = attachments.filter((a) => a.file_type?.startsWith("image/"));
  const fileAtts = attachments.filter((a) => !a.file_type?.startsWith("image/"));

  return (
    <div className="space-y-2">
      {/* 이미지 — 작은 썸네일 가로 나열 */}
      {imageAtts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {imageAtts.map((att) =>
            onSelect ? (
              <button
                key={att.id}
                type="button"
                onClick={() => onSelect(att.file_url)}
                className="w-16 h-16 overflow-hidden border border-rule bg-stone hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              >
                <img
                  src={att.file_url}
                  alt={att.file_name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <a
                key={att.id}
                href={att.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 overflow-hidden border border-rule bg-stone hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              >
                <img
                  src={att.file_url}
                  alt={att.file_name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </a>
            )
          )}
        </div>
      )}

      {/* 파일(PDF 등) — 한 줄 리스트 */}
      {fileAtts.length > 0 && (
        <div className="space-y-1">
          {fileAtts.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 border border-rule px-3 py-1.5 group"
            >
              <FileText size={14} className="text-muted flex-shrink-0" />
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(att.file_url)}
                  className="flex-1 truncate text-small text-ink hover:text-teal transition-colors duration-200 cursor-pointer text-left"
                >
                  {att.file_name}
                </button>
              ) : (
                <a
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-small text-ink hover:text-teal transition-colors duration-200 cursor-pointer"
                >
                  {att.file_name}
                </a>
              )}
              {att.file_size && (
                <span className="text-caption text-muted flex-shrink-0">
                  {att.file_size > 1024 * 1024
                    ? `${(att.file_size / 1024 / 1024).toFixed(1)}MB`
                    : `${(att.file_size / 1024).toFixed(0)}KB`}
                </span>
              )}
              <button
                type="button"
                onClick={() => downloadWithName(att.file_url, att.file_name)}
                className="text-muted hover:text-teal transition-colors duration-200 cursor-pointer flex-shrink-0"
                title="다운로드"
              >
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { isPdfUrl, downloadWithName };
