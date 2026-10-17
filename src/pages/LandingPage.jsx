import { ClaritySection } from "../components/landing/ClaritySection";
import { CtaSection } from "../components/landing/CtaSection";
import { FeatureSection } from "../components/landing/FeatureSection";
import { HeroSection } from "../components/landing/HeroSection";
import { PublicFooter } from "../components/landing/PublicFooter";
import { PublicNav } from "../components/landing/PublicNav";
import { StepsSection } from "../components/landing/StepsSection";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="rs-page">
      <PublicNav />
      <main>
        <HeroSection />
        <FeatureSection />
        <ClaritySection />
        <StepsSection />
        <CtaSection />
      </main>
      <PublicFooter />
    </div>
  );
}
