import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import FeaturedWork from "@/components/sections/FeaturedWork";
import Projects from "@/components/sections/Projects";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { getFeaturedPhotos, getProjects, getServices, getSettings, getTestimonials } from "@/lib/db/queries";

// Content comes from MongoDB (cached 60 s and refreshed instantly when the admin saves).
export const revalidate = 60;

export default async function HomePage() {
  const [settings, featured, projects, services, testimonials] = await Promise.all([
    getSettings(),
    getFeaturedPhotos(8),
    getProjects(),
    getServices(),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <About settings={settings} />
      <FeaturedWork photos={featured} />
      <Projects projects={projects} />
      {services.length ? <Services services={services} /> : null}
      <Testimonials items={testimonials} />
      <Contact settings={settings} services={services} />
    </>
  );
}
