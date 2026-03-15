import {
  Nav,
  Footer,
  Skeleton,
  SkeletonPageHeader,
  SkeletonText,
} from "@/components/common";

export default function PrivacyLoading() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <SkeletonPageHeader />

        {/* 본문 스켈레톤 */}
        <section className="py-12 px-6 md:px-13">
          <div className="max-w-3xl space-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-56 mb-4" />
                <SkeletonText lines={i % 2 === 0 ? 4 : 2} />
                {i % 3 === 0 && (
                  <div className="mt-4 p-4 bg-stone">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
