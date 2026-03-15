import {
  Nav,
  Footer,
  Skeleton,
  SkeletonPageHeader,
  SkeletonText,
} from "@/components/common";

export default function TermsLoading() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <SkeletonPageHeader />

        {/* 본문 스켈레톤 */}
        <section className="py-12 px-6 md:px-13">
          <div className="max-w-3xl space-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-48 mb-4" />
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
