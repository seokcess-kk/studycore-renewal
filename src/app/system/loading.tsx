import {
  Nav,
  Footer,
  Skeleton,
  SkeletonText,
  SkeletonListItem,
} from "@/components/common";

export default function SystemLoading() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {/* 헤더 스켈레톤 */}
        <section className="bg-navy-dark py-20 px-6 md:px-13">
          <div className="max-w-4xl">
            <Skeleton className="h-3 w-40 mb-4 bg-teal/30" />
            <Skeleton className="h-14 w-80 mb-6 bg-white/20" />
            <Skeleton className="h-4 w-full mb-2 bg-white/10" />
            <Skeleton className="h-4 w-2/3 bg-white/10" />
          </div>
        </section>

        {/* 섹션 1 스켈레톤 */}
        <section className="py-16 px-6 md:px-13 border-b border-rule">
          <div className="max-w-4xl">
            <div className="flex items-baseline gap-4 mb-8">
              <Skeleton className="h-12 w-16 bg-navy/10" />
              <Skeleton className="h-8 w-48" />
            </div>
            <SkeletonText lines={4} />
            <div className="mt-6 p-6 bg-stone">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border-l-2 border-rule pl-3">
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 2 스켈레톤 */}
        <section className="py-16 px-6 md:px-13 border-b border-rule">
          <div className="max-w-4xl">
            <div className="flex items-baseline gap-4 mb-8">
              <Skeleton className="h-12 w-16 bg-navy/10" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* 섹션 3 스켈레톤 */}
        <section className="py-16 px-6 md:px-13">
          <div className="max-w-4xl">
            <div className="flex items-baseline gap-4 mb-8">
              <Skeleton className="h-12 w-16 bg-navy/10" />
              <Skeleton className="h-8 w-32" />
            </div>
            <SkeletonText lines={2} className="mb-6" />
            <div className="p-6 bg-stone space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
