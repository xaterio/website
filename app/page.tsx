import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Portfolio from "@/components/landing/Portfolio";
import Middle from "@/components/landing/Middle";
import Footer from "@/components/landing/Footer";
import ScrollIndicator from "@/components/landing/ScrollIndicator";

export default function Home() {
  return (
    <main>
      <Navbar />
      <ScrollIndicator />
      <Hero />
      <Portfolio />
      <Middle />
      <Footer />
    </main>
  );
}
