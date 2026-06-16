import HeroCarousel from './HeroCarousel';
import HeroVideo from './HeroVideo';

function HeroSection({ hero }) {
  if (hero.mode === 'video') {
    return <HeroVideo movie={hero.video.movie} />;
  }

  return <HeroCarousel slides={hero.carousel.slides} />;
}

export default HeroSection;
