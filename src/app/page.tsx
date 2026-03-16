import { Nav, Footer } from "@/components/common";
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
