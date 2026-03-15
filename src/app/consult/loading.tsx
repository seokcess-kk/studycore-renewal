import { Nav, Footer, Skeleton, SkeletonForm } from "@/components/common";

export default function ConsultLoading() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {/* 헤더 스켈레톤 */}
        <section className="bg-navy py-16 px-6 md:px-13 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <Skeleton className="h-3 w-40 mb-4 bg-teal/30" />
            <Skeleton className="h-12 w-64 mb-4 bg-white/20" />
            <Skeleton className="h-4 w-full mb-2 bg-white/10" />
            <Skeleton className="h-4 w-3/4 bg-white/10" />
          </div>
        </section>

        {/* 폼 스켈레톤 */}
        <section className="py-16 px-6 md:px-13">
          <div className="max-w-xl mx-auto">
            <SkeletonForm />

            {/* 연락처 정보 스켈레톤 */}
            <div className="mt-12 p-6 bg-stone">
              <Skeleton className="h-5 w-48 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
