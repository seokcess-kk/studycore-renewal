import { Nav, Footer } from "@/components/common";
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
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProgramsSection />
        <SpaceSlider />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <PopupModal />
    </>
  );
}
