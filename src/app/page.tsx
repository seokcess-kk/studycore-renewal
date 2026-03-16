import { Nav, Footer } from "@/components/common";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/common/JsonLd";
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
      <WebSiteJsonLd />
      <Nav />
      <main>
        <HeroSection />
        <ProgramsSection />
        <FeaturesSection />
        <SpaceSlider />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <PopupModal />
    </>
  );
}
