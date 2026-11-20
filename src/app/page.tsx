import BlueprintGrid from "@/components/BlueprintGrid";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MorphSection from "@/components/MorphSection";
import ReservationModal from "@/components/ReservationModal";
import SpecsSection from "@/components/SpecsSection";
import SceneCanvasLoader from "@/components/three/SceneCanvasLoader";

export default function Home() {
  return (
    <>
      <BlueprintGrid />
      <SceneCanvasLoader />
      <Header />

      {/* No z-index on <main>: sections must share the root stacking context with the fixed canvas (z-10). */}
      <main className="relative">
        <HeroSection />
        <MorphSection />
        <FeaturesSection />
        <SpecsSection />
      </main>

      <Footer />
      <ReservationModal />
    </>
  );
}
