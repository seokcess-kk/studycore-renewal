"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { search } from "@/domains/search/service";
import type { SearchResult } from "@/domains/search/model";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 모달 열릴 때 input 포커스 + 닫힐 때 debounce 정리
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setFocusIndex(-1);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isOpen]);

  // ESC 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 검색 debounce
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const supabase = createClient();
    const data = await search(supabase, q);
    setResults(data);
    setFocusIndex(-1);
    setIsSearching(false);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && focusIndex >= 0 && results[focusIndex]) {
      e.preventDefault();
      navigateTo(results[focusIndex].url);
    }
  };

  const navigateTo = (url: string) => {
    onClose();
    router.push(url);
  };

  const typeBadge = (type: string) => {
    if (type === "notice") return { label: "공지", className: "bg-navy/10 text-navy" };
    return { label: "블로그", className: "bg-teal/10 text-teal" };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[500] flex items-start justify-center pt-[15vh] bg-ink/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg mx-4 bg-white border border-rule overflow-hidden"
          >
            {/* 검색 입력 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-rule">
              <Search size={18} className="text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="공지사항, 블로그 검색..."
                className="flex-1 text-[15px] text-ink placeholder:text-muted/50 outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-ink p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* 결과 */}
            <div className="max-h-[50vh] overflow-y-auto">
              {isSearching ? (
                <div className="p-6 text-center text-muted text-[14px]">
                  검색 중...
                </div>
              ) : query && results.length === 0 ? (
                <div className="p-6 text-center text-muted text-[14px]">
                  검색 결과가 없습니다.
                </div>
              ) : (
                results.map((result, i) => {
                  const badge = typeBadge(result.type);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      type="button"
                      onClick={() => navigateTo(result.url)}
                      className={`w-full text-left px-4 py-3 border-b border-rule last:border-b-0 hover:bg-stone transition-colors ${
                        i === focusIndex ? "bg-stone" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-medium px-1.5 py-0.5 ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[12px] text-muted">
                          {new Date(result.date).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <p className="text-[14px] font-medium text-ink truncate">
                        {result.title}
                      </p>
                      {result.excerpt && (
                        <p className="text-[12px] text-muted truncate mt-0.5">
                          {result.excerpt}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* 하단 힌트 */}
            <div className="px-4 py-2 border-t border-rule bg-stone/50 flex items-center gap-4 text-[11px] text-muted">
              <span>↑↓ 이동</span>
              <span>Enter 열기</span>
              <span>ESC 닫기</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
