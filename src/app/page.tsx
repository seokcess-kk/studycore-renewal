import { Nav, Footer, PendingBanner } from "@/components/common";
import { OrganizationJsonLd, FAQJsonLd, WebSiteJsonLd } from "@/components/common/JsonLd";
import {
  HeroSection,
  FeaturesSection,
  SpaceSlider,
  FAQSection,
  CTASection,
  PopupModal,
  ProgramsSection,
} from "@/components/home";

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <FAQJsonLd />
      <WebSiteJsonLd />
      <Nav />
      <PendingBanner />
      <main>
        <HeroSection />
        {/* navy → stone 전환 */}
        <div className="h-[2px] bg-teal" />
        <FeaturesSection />
        {/* stone → navy-dark 전환 */}
        <div className="h-[2px] bg-teal" />
        <ProgramsSection />
        {/* navy-dark → white 전환 */}
        <div className="h-[2px] bg-teal/50" />
        <SpaceSlider />
        <FAQSection />
        {/* white → navy 전환 */}
        <div className="h-[2px] bg-teal" />
        <CTASection />
      </main>
      <Footer />
      <PopupModal />
    </>
  );
}
