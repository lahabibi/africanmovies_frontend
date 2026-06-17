import HeroDetails from './HeroDetails';

function HeroVideo({ movie }) {
  if (!movie) {
    return null;
  }

  const iframeVideoUrl =
    !movie.videoSrc && movie.trailerUrl
      ? getAutoplayEmbedUrl(movie.trailerUrl)
      : null;

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
      ) : iframeVideoUrl ? (
        <iframe
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          aria-hidden="true"
          className="hero-banner__video hero-banner__video-frame"
          src={iframeVideoUrl}
          title={`${movie.title} hero video`}
        />
      ) : (
        <img className="hero-banner__image" src={movie.poster || movie.banner} alt="" aria-hidden="true" />
      )}
      <div className="hero-banner__shade" />
      <HeroDetails movie={movie} />
    </section>
  );
}

function getAutoplayEmbedUrl(url) {
  try {
    const embedUrl = new URL(url);
    embedUrl.searchParams.set("autoplay", "true");
    embedUrl.searchParams.set("muted", "true");
    embedUrl.searchParams.set("loop", "true");
    embedUrl.searchParams.set("controls", "false");
    return embedUrl.toString();
  } catch {
    return url;
  }
}

export default HeroVideo;
