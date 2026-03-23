"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getBlogById, updateBlog, copyForNaver } from "@/domains/blog/service";
import {
  updateBlogPostSchema,
  type UpdateBlogPostInput,
  type BlogPostWithAuthor,
} from "@/domains/blog/model";
import { useToast } from "@/components/common/Toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Eye, EyeOff, Tag, X, Copy, ExternalLink } from "lucide-react";

export default function AdminBlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { showToast } = useToast();

  const [post, setPost] = useState<BlogPostWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateBlogPostSchema),
  });

  const tags = watch("tags") || [];
  const isPublished = watch("is_published");

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      const supabase = createClient();
      const result = await getBlogById(supabase, postId);

      if (result.success && result.post) {
        const postData = result.post as BlogPostWithAuthor;
        setPost(postData);
        reset({
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          excerpt: postData.excerpt || "",
          thumbnail_url: postData.thumbnail_url || "",
          tags: postData.tags,
          is_published: postData.is_published,
        });
      } else {
        showToast("포스트를 찾을 수 없습니다.", "error");
        router.push("/admin/blog");
      }
      setIsLoading(false);
    }

    fetchPost();
  }, [postId, reset, router, showToast]);

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

  // 네이버 복사
  const handleCopyForNaver = async () => {
    if (!post) return;

    const content = watch("content");
    const title = watch("title");
    const thumbnail_url = watch("thumbnail_url");

    const html = copyForNaver(
      { title: title || "", content: content || "", thumbnail_url },
      window.location.origin
    );

    try {
      // HTML 형식으로 클립보드 복사
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([content || ""], { type: "text/plain" }),
        }),
      ]);
      showToast("네이버 블로그 형식으로 복사되었습니다.", "success");
    } catch {
      // 폴백: 일반 텍스트로 복사
      await navigator.clipboard.writeText(content || "");
      showToast("텍스트가 복사되었습니다. (HTML 복사 실패)", "info");
    }
  };

  const onSubmit = async (data: UpdateBlogPostInput) => {
    setIsSubmitting(true);

    const supabase = createClient();
    const result = await updateBlog(supabase, postId, data);

    setIsSubmitting(false);

    if (result.success) {
      showToast("포스트가 저장되었습니다.", "success");
      // 상태 업데이트
      if (result.post) {
        setPost(result.post as BlogPostWithAuthor);
      }
    } else {
      showToast(result.error || "오류가 발생했습니다.", "error");
    }
  };

  if (isLoading) {
    return (
      <>
        <AdminHeader
          title="포스트 수정"
          breadcrumb={[
            { label: "대시보드", href: "/admin" },
            { label: "블로그 관리", href: "/admin/blog" },
            { label: "수정" },
          ]}
        />
        <div className="p-6 max-w-4xl space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="포스트 수정"
        breadcrumb={[
          { label: "대시보드", href: "/admin" },
          { label: "블로그 관리", href: "/admin/blog" },
          { label: post?.title || "수정" },
        ]}
      />

      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 상태 표시 */}
          {post && (
            <div className="flex items-center gap-4 p-4 bg-stone border border-rule">
              <span
                className={`px-2 py-1 text-small font-medium ${
                  isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {isPublished ? "발행됨" : "임시저장"}
              </span>
              {post.published_at && (
                <span className="text-secondary text-muted">
                  발행일: {new Date(post.published_at).toLocaleDateString("ko-KR")}
                </span>
              )}
              {isPublished && (
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-secondary text-teal hover:text-teal-d transition-colors duration-200"
                >
                  <ExternalLink size={14} />
                  미리보기
                </a>
              )}
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="포스트 제목을 입력하세요"
              className="w-full px-4 py-3 border border-rule text-reading focus:border-navy focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-secondary text-red-500">
                {errors.title.message}
              </p>
            )}
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
                className="flex-1 px-4 py-3 border border-rule text-reading focus:border-navy focus:outline-none font-mono"
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-secondary text-red-500">
                {errors.slug.message}
              </p>
            )}
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
              className="w-full px-4 py-3 border border-rule text-reading focus:border-navy focus:outline-none resize-none"
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
              className="w-full px-4 py-3 border border-rule text-reading focus:border-navy focus:outline-none"
            />
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
                  className="w-full pl-10 pr-4 py-2 border border-rule text-body focus:border-navy focus:outline-none"
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
              className="w-full px-4 py-3 border border-rule text-reading font-mono focus:border-navy focus:outline-none resize-y"
            />
            {errors.content && (
              <p className="mt-1 text-secondary text-red-500">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* 발행 상태 */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_published")}
                className="w-4 h-4 border border-rule"
              />
              <span className="text-body text-ink">발행</span>
            </label>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-navy text-white text-body font-medium hover:bg-navy-d transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              저장
            </button>

            {isPublished && (
              <button
                type="button"
                onClick={handleCopyForNaver}
                className="flex items-center gap-2 px-6 py-3 border border-rule text-ink text-body font-medium hover:border-navy transition-colors"
              >
                <Copy size={16} />
                네이버 복사
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setValue("is_published", !isPublished);
              }}
              className="flex items-center gap-2 px-6 py-3 border border-rule text-ink text-body font-medium hover:border-navy transition-colors"
            >
              {isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
              {isPublished ? "발행 취소" : "발행하기"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/blog")}
              className="px-6 py-3 text-muted text-body hover:text-ink transition-colors"
            >
              목록
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
