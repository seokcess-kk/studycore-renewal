import { Nav, Footer } from "@/components/common";
import {
  HeroSection,
  FeaturesSection,
  SpaceSlider,
  FAQSection,
  CTASection,
} from "@/components/home";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <SpaceSlider />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
