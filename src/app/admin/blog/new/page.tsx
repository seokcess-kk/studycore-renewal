"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createBlog } from "@/domains/blog/service";
import {
  createBlogPostSchema,
  generateSlug,
  type CreateBlogPostInput,
} from "@/domains/blog/model";
import { useUserStore } from "@/stores/useUserStore";
import { useToast } from "@/components/common/Toast";
import { FormError } from "@/components/common";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Eye, Tag, X } from "lucide-react";

export default function AdminBlogNewPage() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createBlogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      thumbnail_url: "",
      tags: [] as string[],
      is_published: false,
    },
  });

  const title = watch("title");
  const tags = watch("tags") || [];

  // 제목이 변경되면 슬러그 자동 생성
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);

    // 슬러그가 비어있거나 자동 생성된 상태면 업데이트
    const currentSlug = watch("slug");
    if (!currentSlug || currentSlug === generateSlug(title)) {
      setValue("slug", generateSlug(newTitle));
    }
  };

  // 태그 추가
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setValue("tags", [...tags, trimmedTag]);
      setTagInput("");
    }
  };

  // 태그 삭제
  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data: CreateBlogPostInput, publish: boolean) => {
    if (!profile?.id) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const result = await createBlog(supabase, profile.id, {
      ...data,
      is_published: publish,
    });

    setIsSubmitting(false);

    if (result.success) {
      showToast(
        publish ? "포스트가 발행되었습니다." : "임시저장 되었습니다.",
        "success"
      );
      router.push("/admin/blog");
    } else {
      showToast(result.error || "오류가 발생했습니다.", "error");
    }
  };

  return (
    <div className="max-w-4xl">
        <form className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              onChange={handleTitleChange}
              placeholder="포스트 제목을 입력하세요"
              className="input-admin"
            />
            <FormError message={errors.title?.message} />
          </div>

          {/* 슬러그 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              슬러그 (URL)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-body text-muted">/blog/</span>
              <input
                type="text"
                {...register("slug")}
                placeholder="post-slug"
                className="input-admin flex-1 font-mono"
              />
            </div>
            <FormError message={errors.slug?.message} />
            <p className="mt-1 text-small text-muted">
              영문 소문자, 숫자, 하이픈만 사용 가능합니다.
            </p>
          </div>

          {/* 요약 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              요약
            </label>
            <textarea
              {...register("excerpt")}
              rows={2}
              placeholder="포스트 요약 (목록에 표시됩니다)"
              className="input-admin resize-none"
            />
          </div>

          {/* 썸네일 URL */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              썸네일 URL
            </label>
            <input
              type="text"
              {...register("thumbnail_url")}
              placeholder="https://example.com/image.jpg"
              className="input-admin"
            />
            <FormError message={errors.thumbnail_url?.message} />
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              태그
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Tag
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="태그 입력 후 Enter"
                  className="input-admin pl-10"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-stone text-ink text-body font-medium hover:bg-rule transition-colors"
              >
                추가
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-stone text-secondary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted hover:text-ink transition-colors duration-200"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 본문 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              본문 (Markdown) <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("content")}
              rows={20}
              placeholder="Markdown 형식으로 작성하세요..."
              className="input-admin font-mono resize-y"
            />
            <FormError message={errors.content?.message} />
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 border border-rule text-ink text-body font-medium hover:border-navy transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              임시저장
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-teal text-white text-body font-medium hover:bg-teal-d transition-colors disabled:opacity-50"
            >
              <Eye size={16} />
              발행하기
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/blog")}
              className="px-6 py-3 text-muted text-body hover:text-ink transition-colors"
            >
              취소
            </button>
          </div>
        </form>
    </div>
  );
}
