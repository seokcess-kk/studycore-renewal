import {
  Nav,
  Footer,
  Skeleton,
  SkeletonText,
} from "@/components/common";

export default function SystemLoading() {
  return (
    <>
      <Nav />
      <main className="page-body">
        {/* 히어로 스켈레톤 */}
        <section className="bg-navy-dark section-lg px-6 md:px-13">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-3 w-40 mb-6 bg-teal/30" />
            <Skeleton className="h-12 w-80 mb-3 bg-white/20" />
            <Skeleton className="h-12 w-64 mb-6 bg-white/20" />
            <Skeleton className="h-4 w-full max-w-lg mb-2 bg-white/10" />
            <Skeleton className="h-4 w-2/3 max-w-lg bg-white/10" />
          </div>
        </section>

        {/* 다이어그램 스켈레톤 */}
        <section className="bg-white section-lg px-6 md:px-13">
          <div className="max-w-5xl mx-auto text-center">
            <Skeleton className="h-3 w-32 mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-16" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-14 h-14" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 시스템 섹션 스켈레톤 */}
        {Array.from({ length: 3 }).map((_, i) => (
          <section
            key={i}
            className={`section-md px-6 md:px-13 ${i % 2 === 0 ? "bg-stone" : "bg-white"}`}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-baseline gap-4 mb-8">
                <Skeleton className="h-12 w-16 bg-navy/10" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-6 w-72 mb-8" />
              <SkeletonText lines={4} />
            </div>
          </section>
        ))}

        {/* 마무리 스켈레톤 */}
        <section className="bg-navy-dark section-lg px-6 md:px-13">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-10 w-72 mx-auto mb-10 bg-white/20" />
            <Skeleton className="h-4 w-64 mx-auto mb-3 bg-white/10" />
            <Skeleton className="h-4 w-48 mx-auto bg-white/10" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
