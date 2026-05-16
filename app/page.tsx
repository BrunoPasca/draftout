import { Board } from "@/components/sections/Board";
import { Competitive } from "@/components/sections/Competitive";
import { FAQ } from "@/components/sections/FAQ";
import { FooterCta } from "@/components/sections/FooterCta";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SocialProof } from "@/components/sections/SocialProof";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Board />
      <Competitive />
      <SocialProof />
      <FAQ />
      <FooterCta />
    </>
  );
}
