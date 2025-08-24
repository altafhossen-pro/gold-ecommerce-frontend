import Header from "@/components/Header/Header";
import CategorySlider from "@/components/Homepage/CategorySlider/CategorySlider";
import HeroSection from "@/components/Homepage/HeroSection/HeroSection";
import FeaturedProducts from "@/components/Homepage/FeaturedProducts/FeaturedProducts";
import BestSellingProducts from "@/components/Homepage/BestSellingProducts/BestSellingProducts";
import NewArrivalProducts from "@/components/Homepage/NewArrivalProducts/NewArrivalProducts";
import CustomerTestimonial from "@/components/Homepage/CustomerTestimonial/CustomerTestimonial";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <CategorySlider />
      <FeaturedProducts />
      <BestSellingProducts />
      <NewArrivalProducts />
      <CustomerTestimonial />
      <Footer />
    </div>
  );
}
