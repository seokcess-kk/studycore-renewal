/**
 * 저장 HTML(Tiptap·관리자 입력)을 dangerouslySetInnerHTML로 렌더링하기 전 정제하는 유틸.
 *
 * 사용 정책
 * - 입력 시점 정제는 향후 추가 — 현재는 렌더 시점 1차 방어선.
 * - Tiptap StarterKit + image + link 출력에 맞춰 화이트리스트 구성.
 * - script/iframe/style/on* 이벤트 핸들러 등 위험 요소는 모두 제거.
 */
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "span", "strong", "b", "em", "i", "u", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "hr",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "title", "class"];

let hookAdded = false;
function ensureLinkHardeningHook() {
  if (hookAdded) return;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeName === "A") {
      const el = node as Element;
      if (el.getAttribute("target") === "_blank") {
        el.setAttribute("rel", "noopener noreferrer");
      }
      const href = el.getAttribute("href") || "";
      if (/^\s*javascript:/i.test(href) || /^\s*data:/i.test(href)) {
        el.removeAttribute("href");
      }
    }
  });
  hookAdded = true;
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  ensureLinkHardeningHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "meta", "link"],
    FORBID_ATTR: [
      "onerror", "onload", "onclick", "onmouseover", "onmouseout",
      "onfocus", "onblur", "onchange", "onsubmit", "onkeydown", "onkeyup",
      "style",
    ],
  });
}
