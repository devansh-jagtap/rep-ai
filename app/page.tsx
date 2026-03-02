import type { Metadata } from "next";
import HeroSection from "@/components/hero-section-2";
import Features from "@/components/features-3";
import Integrations from "@/components/integrations-1";
import Content from "@/components/content-3";
import Pricing from "@/components/pricing-3";
// import CallToAction from "@/components/call-to-action-4";
import Footer from "@/components/footer-5";

export const metadata: Metadata = {
  title: "AI Portfolio Builder for Creators & Freelancers",
  description:
    "Build and launch an AI-powered portfolio that answers visitor questions, captures leads, and helps convert clients.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <Features />
      <Integrations />
      <Content />
      <Pricing />
      {/* <CallToAction /> */}
      <Footer />
    </div>
  );
}
