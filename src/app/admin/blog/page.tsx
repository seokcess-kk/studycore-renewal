"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Skeleton } from "@/components/common";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getBlogList, deleteBlog, publishBlog, unpublishBlog } from "@/domains/blog/service";
import type { BlogPostWithAuthor } from "@/domains/blog/model";
import { useToast } from "@/components/common/Toast";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
  Filter,
} from "lucide-react";

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostWithAuthor | null>(null);
  const { showToast } = useToast();
  const pageSize = 10;

  const fetchPosts = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const result = await getBlogList(supabase, {
      publishedOnly: filter === "published" ? true : filter === "draft" ? false : undefined,
      search: search || undefined,
      page,
      pageSize,
    });

    if (result.success) {
      // 필터가 draft일 때는 발행되지 않은 포스트만 표시
      const filteredPosts = filter === "draft"
        ? result.posts.filter(p => !p.is_published)
        : result.posts;
      setPosts(filteredPosts);
      setTotal(result.total);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleTogglePublish = async (post: BlogPostWithAuthor) => {
    const supabase = createClient();
    const result = post.is_published
      ? await unpublishBlog(supabase, post.id)
      : await publishBlog(supabase, post.id);

    if (result.success) {
      showToast(post.is_published ? "발행이 취소되었습니다." : "포스트가 발행되었습니다.", "success");
      fetchPosts();
    } else {
      showToast(result.error || "오류가 발생했습니다.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const supabase = createClient();
    const result = await deleteBlog(supabase, deleteTarget.id);

    if (result.success) {
      showToast("포스트가 삭제되었습니다.", "success");
      setDeleteTarget(null);
      fetchPosts();
    } else {
      showToast(result.error || "삭제에 실패했습니다.", "error");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <AdminHeader
        title="블로그 관리"
        breadcrumb={[
          { label: "대시보드", href: "/admin" },
          { label: "블로그 관리" },
        ]}
      />

      <div className="p-6">
        {/* 상단 액션 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          {/* 검색 */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="제목 또는 내용 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-rule text-[14px] focus:border-navy focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-navy text-white text-[14px] font-medium hover:bg-navy-d transition-colors"
            >
              검색
            </button>
          </form>

          <div className="flex gap-2">
            {/* 필터 */}
            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as "all" | "published" | "draft");
                  setPage(1);
                }}
                className="pl-10 pr-8 py-2 border border-rule text-[14px] focus:border-navy focus:outline-none appearance-none bg-white"
              >
                <option value="all">전체</option>
                <option value="published">발행됨</option>
                <option value="draft">임시저장</option>
              </select>
            </div>

            {/* 새 포스트 */}
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-2 px-4 py-2 bg-teal text-white text-[14px] font-medium hover:bg-teal-d transition-colors"
            >
              <Plus size={16} />
              새 포스트
            </Link>
          </div>
        </div>

        {/* 포스트 목록 */}
        <div className="bg-white border border-rule overflow-x-auto">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-[1fr_100px_120px_120px] gap-4 px-4 py-3 border-b border-rule bg-stone text-[13px] font-medium text-muted min-w-[640px]">
            <div>제목</div>
            <div className="text-center">상태</div>
            <div className="text-center">작성일</div>
            <div className="text-center">액션</div>
          </div>

          {/* 테이블 본문 */}
          {isLoading ? (
            <div className="divide-y divide-rule">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_100px_120px_120px] gap-4 px-4 py-4 min-w-[640px]"
                >
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-16 mx-auto" />
                  <Skeleton className="h-5 w-20 mx-auto" />
                  <Skeleton className="h-5 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p>등록된 포스트가 없습니다.</p>
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 mt-4 text-teal hover:text-teal-d"
              >
                <Plus size={16} />
                첫 포스트 작성하기
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-rule">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="grid grid-cols-[1fr_100px_120px_120px] gap-4 px-4 py-4 items-center hover:bg-stone/50 transition-colors cursor-pointer min-w-[640px]"
                  onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                >
                  {/* 제목 */}
                  <div>
                    <p className="text-[15px] font-medium text-ink line-clamp-1">
                      {post.title}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] px-1.5 py-0.5 bg-stone text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 상태 */}
                  <div className="text-center">
                    <StatusBadge
                      status={post.is_published ? "active" : "pending"}
                      labels={{
                        active: "발행됨",
                        pending: "임시저장",
                      }}
                    />
                  </div>

                  {/* 작성일 */}
                  <div className="text-center text-[13px] text-muted">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </div>

                  {/* 액션 */}
                  <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {post.is_published && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-muted hover:text-navy transition-colors"
                        title="미리보기"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    )}
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className="p-2 text-muted hover:text-navy transition-colors"
                      title={post.is_published ? "발행 취소" : "발행"}
                    >
                      {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="p-2 text-muted hover:text-navy transition-colors"
                      title="수정"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(post)}
                      className="p-2 text-muted hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 text-[14px] font-medium border transition-colors ${
                  page === i + 1
                    ? "bg-navy border-navy text-white"
                    : "border-rule text-ink hover:border-navy"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="포스트 삭제"
        message={`"${deleteTarget?.title}" 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        confirmVariant="danger"
      />
    </>
  );
}
