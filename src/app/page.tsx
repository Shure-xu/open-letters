import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InsideSection } from "@/components/InsideSection";
import { IssuesSection } from "@/components/IssuesSection";
import { RhythmSection } from "@/components/RhythmSection";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <InsideSection />
      <RhythmSection />
      <IssuesSection />
      <CtaSection />
      <Footer />
    </>
  );
}
