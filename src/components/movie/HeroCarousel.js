import { useEffect, useState } from 'react';
import leftChevron from '../../assets/icons/ic_left_chevron.png';
import rightChevron from '../../assets/icons/ic_right_chevron.png';
import HeroDetails from './HeroDetails';

function HeroCarousel({ slides }) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const movie = slides[activeSlideIndex];

  useEffect(() => {
    if (slides.length <= 1 || isCarouselPaused) {
      return undefined;
    }

    const autoScrollTimer = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) => (currentIndex === slides.length - 1 ? 0 : currentIndex + 1));
    }, 6000);

    return () => window.clearInterval(autoScrollTimer);
  }, [isCarouselPaused, slides.length]);

  if (!movie) {
    return null;
  }

  const showPreviousSlide = () => {
    setActiveSlideIndex((currentIndex) => (currentIndex === 0 ? slides.length - 1 : currentIndex - 1));
  };

  const showNextSlide = () => {
    setActiveSlideIndex((currentIndex) => (currentIndex === slides.length - 1 ? 0 : currentIndex + 1));
  };

  return (
    <section
      className="hero-banner"
      aria-label="Featured movie carousel"
      onBlur={() => setIsCarouselPaused(false)}
      onFocus={() => setIsCarouselPaused(true)}
      onMouseEnter={() => setIsCarouselPaused(true)}
      onMouseLeave={() => setIsCarouselPaused(false)}
    >
      <img className="hero-banner__image" key={movie.id} src={movie.banner} alt="" aria-hidden="true" />
      <div className="hero-banner__shade" />

      <button
        className="hero-banner__arrow hero-banner__arrow--left"
        type="button"
        aria-label="Previous featured movie"
        onClick={showPreviousSlide}
      >
        <img src={leftChevron} alt="" aria-hidden="true" />
      </button>

      <HeroDetails movie={movie} isLive />

      <div className="hero-banner__dots" aria-label="Featured movie pagination">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={index === activeSlideIndex ? 'is-active' : ''}
            type="button"
            aria-label={`Show ${slide.title}`}
            aria-pressed={index === activeSlideIndex}
            onClick={() => setActiveSlideIndex(index)}
          />
        ))}
      </div>

      <button
        className="hero-banner__arrow hero-banner__arrow--right"
        type="button"
        aria-label="Next featured movie"
        onClick={showNextSlide}
      >
        <img src={rightChevron} alt="" aria-hidden="true" />
      </button>
    </section>
  );
}

export default HeroCarousel;
