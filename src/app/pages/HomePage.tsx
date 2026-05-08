import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Methods } from '../components/Methods';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { Pricing } from '../components/Pricing';
import { HowToRegister } from '../components/HowToRegister';
import { FAQ } from '../components/FAQ';
import { Activities } from '../components/Activities';
import { Contact } from '../components/Contact';

export function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Methods />
      <WhyChooseUs />
      <Pricing />
      <HowToRegister />
      <FAQ />
      <Activities />
      <Contact />
    </>
  );
}
