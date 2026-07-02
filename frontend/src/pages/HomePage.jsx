import Hero from '../components/Hero';
import MenuSection from '../components/MenuSection';
import InsideKitchen from '../components/InsideKitchen';
import CustomizePizza from '../components/CustomizePizza';
import CTASection from '../components/CTASection';

function HomePage() {
  return (
    <main>
      <Hero />
      <MenuSection />
      <InsideKitchen />
      <CustomizePizza />
      <CTASection />
    </main>
  );
}

export default HomePage;
