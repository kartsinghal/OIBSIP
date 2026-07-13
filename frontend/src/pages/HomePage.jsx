import Hero from '../components/Hero';
import InsideKitchen from '../components/InsideKitchen';
import EditorialQuote from '../components/EditorialQuote';
import CustomizePizza from '../components/CustomizePizza';
import CTASection from '../components/CTASection';

function HomePage() {
  return (
    <main>
      <Hero />
      <InsideKitchen />
      <EditorialQuote />
      <CustomizePizza />
      <CTASection />
    </main>
  );
}

export default HomePage;
