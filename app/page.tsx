import Hero from "@/components/home/Hero";
import HomeSetup from "@/components/home/HomeSetup";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-4 py-12 md:py-20 max-w-4xl mx-auto">
      <Hero />
      <div className="w-full mt-12 space-y-6">
        <HomeSetup />
      </div>
    </div>
  );
}
