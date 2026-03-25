"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@/lib/supabase/client";
import { getActivePopups } from "@/domains/popup/service";
import { getNoticeAttachments } from "@/domains/notice/service";
import type { Popup } from "@/domains/popup/model";
import { MetaAttachmentList } from "@/components/common";
import type { NoticeAttachment } from "@/domains/notice/model";
import { useFocusTrap } from "@/hooks/useFocusTrap";

function isDismissedToday(popupId: string): boolean {
  const key = `popup_dismissed_${popupId}`;
  const dismissed = localStorage.getItem(key);
  if (!dismissed) return false;
  const today = new Date().toISOString().split("T")[0];
  return dismissed === today;
}

function dismissToday(popupId: string) {
  const key = `popup_dismissed_${popupId}`;
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(key, today);
}

export function PopupModal() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);
  const focusTrapRef = useFocusTrap(isOpen);

  useEffect(() => {
    async function loadPopup() {
      const supabase = createBrowserClient();
      const popups = await getActivePopups(supabase);
      const visible = popups.find((p) => !isDismissedToday(p.id));
      if (visible) {
        setPopup(visible);
        setIsOpen(true);
        // 공지 연결 시 첨부파일 로드
        if (visible.notice_id) {
          const atts = await getNoticeAttachments(supabase, visible.notice_id);
          setAttachments(atts);
        }
      }
    }
    loadPopup();
  }, []);

  const handleClose = () => setIsOpen(false);

  const handleDismissToday = () => {
    if (popup) dismissToday(popup.id);
    setIsOpen(false);
  };

  const linkUrl = popup?.notice_id
    ? `/notices/${popup.notice_id}`
    : popup?.link_url || null;

  return (
    <AnimatePresence>
      {isOpen && popup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-ink/50 p-4"
          onClick={handleClose}
        >
          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-modal-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md border border-rule bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              aria-label="닫기"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center bg-ink/60 text-white hover:bg-ink transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* 이미지 */}
            {popup.image_url && (
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={popup.image_url}
                  alt={popup.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* 콘텐츠 */}
            <div className="p-6">
              <h3 id="popup-modal-title" className="mb-2 font-serif text-lg font-bold text-navy">
                {popup.title}
              </h3>
              {popup.content && (
                <p className="mb-4 whitespace-pre-wrap text-body text-ink leading-prose">
                  {popup.content}
                </p>
              )}
              {/* 공지 첨부파일 */}
              {attachments.length > 0 && (
                <div className="mb-4">
                  <MetaAttachmentList attachments={attachments} />
                </div>
              )}

              {linkUrl && (
                <a
                  href={linkUrl}
                  className="cta-fill cta-fill-teal inline-flex items-center border-[1.5px] border-teal px-5 py-2.5 text-secondary font-bold tracking-cta text-navy-dark hover:text-teal transition-colors duration-300"
                >
                  {popup.link_text || "자세히 보기"}
                </a>
              )}
            </div>

            {/* 오늘 하루 안 보기 */}
            <div className="border-t border-rule px-6 py-3">
              <button
                onClick={handleDismissToday}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                오늘 하루 안 보기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
