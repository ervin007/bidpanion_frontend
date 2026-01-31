import LandingHeroMinimal from "./_components/LandingHeroMinimal";
import LandingFeaturesMinimal from "./_components/LandingFeaturesMinimal";
import LandingPricingMinimal from "./_components/LandingPricingMinimal";
import LandingFooterMinimal from "./_components/LandingFooterMinimal";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeroMinimal />
      <LandingFeaturesMinimal />
      <LandingPricingMinimal />
      <LandingFooterMinimal />
    </div>
  );
}
