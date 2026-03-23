"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  isActive = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 transition-colors",
        isActive
          ? "text-ink bg-white"
          : "text-muted hover:text-ink hover:bg-white"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-teal underline" },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] p-4 prose prose-sm max-w-none focus:outline-none " +
          "prose-headings:font-serif prose-h2:text-xl prose-h2:font-bold prose-h3:text-lg prose-h3:font-bold " +
          "prose-blockquote:border-l-2 prose-blockquote:border-teal prose-blockquote:pl-4 prose-blockquote:text-muted " +
          "prose-a:text-teal prose-a:underline",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // 수정 페이지: 초기 content가 비동기로 로드될 때 에디터에 반영
  // onUpdate → onChange → setValue → content 변경 루프 방지를 위해
  // 에디터가 비어있을 때만 외부 content를 설정
  useEffect(() => {
    if (editor && editor.isEmpty && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const isSafeUrl = (url: string) => /^https?:\/\//i.test(url);

  const addLink = () => {
    const url = window.prompt("URL 입력 (https://...):");
    if (url && isSafeUrl(url)) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("이미지 URL 입력 (https://...):");
    if (url && isSafeUrl(url)) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div>
      {/* 툴바 */}
      <div className="border border-rule bg-stone p-2 flex flex-wrap gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="굵게"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="기울임"
        >
          <Italic size={16} />
        </ToolbarButton>

        <span className="w-px bg-rule mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="제목 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="제목 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <span className="w-px bg-rule mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="목록"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="번호 목록"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="인용"
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus size={16} />
        </ToolbarButton>

        <span className="w-px bg-rule mx-1" />

        <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="링크">
          <LinkIcon size={16} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="링크 해제"
          >
            <Unlink size={16} />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={addImage} title="이미지">
          <ImageIcon size={16} />
        </ToolbarButton>
      </div>

      {/* 에디터 */}
      <div className="border border-t-0 border-rule bg-white relative">
        {placeholder && editor.isEmpty && (
          <div className="absolute p-4 text-muted/50 text-body pointer-events-none">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
