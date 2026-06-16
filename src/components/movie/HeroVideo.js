import HeroDetails from './HeroDetails';

function HeroVideo({ movie }) {
  if (!movie) {
    return null;
  }

  return (
    <section className="hero-banner hero-banner--video" aria-label="Featured movie video">
      {movie.videoSrc ? (
        <video
          className="hero-banner__video"
          autoPlay
          loop
          muted
          playsInline
          poster={movie.poster || movie.banner}
          src={movie.videoSrc}
        />
      ) : (
        <img className="hero-banner__image" src={movie.poster || movie.banner} alt="" aria-hidden="true" />
      )}
      <div className="hero-banner__shade" />
      <HeroDetails movie={movie} />
    </section>
  );
}

export default HeroVideo;
