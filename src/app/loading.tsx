import { Nav, Footer, Skeleton } from "@/components/common";

export default function HomeLoading() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero 스켈레톤 */}
        <section className="min-h-screen bg-navy-dark relative overflow-hidden">
          <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            <div className="flex flex-col justify-end p-8 md:p-14 lg:border-r lg:border-white/[0.06]">
              <Skeleton className="h-4 w-48 mb-10 bg-teal/20" />
              <div className="space-y-4">
                <Skeleton className="h-20 w-3/4 bg-white/10" />
                <Skeleton className="h-20 w-2/3 bg-white/10" />
                <Skeleton className="h-20 w-1/2 bg-white/10" />
              </div>
            </div>
            <div className="hidden lg:flex flex-col justify-between p-14">
              <div className="pt-10">
                <Skeleton className="h-4 w-full mb-4 bg-white/10" />
                <Skeleton className="h-4 w-full mb-4 bg-white/10" />
                <Skeleton className="h-4 w-3/4 mb-12 bg-white/10" />
                <Skeleton className="h-12 w-48 bg-teal/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Features 스켈레톤 */}
        <section className="bg-stone py-28 px-6 md:px-13">
          <div className="flex flex-col md:flex-row md:items-baseline gap-5 border-b border-ink pb-10 mb-8">
            <Skeleton className="h-4 w-32 bg-teal/30" />
            <Skeleton className="h-12 w-64" />
          </div>
          <div className="space-y-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[100px_1fr] md:grid-cols-[160px_1fr] border-b border-rule py-11"
              >
                <div className="border-r border-rule pr-4">
                  <Skeleton className="h-16 w-16 bg-navy/10" />
                </div>
                <div className="pl-6 md:pl-12">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
