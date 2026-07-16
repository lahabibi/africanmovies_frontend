import HeroDetails from "./HeroDetails";
import { useTrailerAccess } from "../../hooks/useCatalog";
import { resolveTrailerPlaybackSource } from "../../utils/trailerPlayback";

function HeroVideo({ movie }) {
  const trailerUrl = movie?.trailerUrl || "";
  const movieId = movie?.backendId || movie?.id;
  const canRequestTrailerAccess = isMongoObjectId(movieId);
  const { data: trailerAccess } = useTrailerAccess(movieId, {
    enabled: Boolean(trailerUrl && canRequestTrailerAccess),
  });
  const trailerSource = trailerAccess
    ? resolveTrailerPlaybackSource(trailerAccess, movie)
    : !canRequestTrailerAccess
      ? resolveTrailerPlaybackSource(null, movie)
      : null;

  if (!movie) {
    return null;
  }

  return (
    <section
      className="hero-banner hero-banner--video"
      aria-label="Featured movie video"
    >
      {trailerSource?.type === "video" ? (
        <video
          className="hero-banner__video"
          autoPlay
          loop
          muted
          playsInline
          poster={movie.poster || movie.banner}
          src={trailerSource.src}
        />
      ) : trailerSource?.type === "iframe" ? (
        <iframe
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          aria-hidden="true"
          className="hero-banner__video hero-banner__video-frame"
          src={getAutoplayEmbedUrl(trailerSource.src)}
          title={`${movie.title} hero video`}
        />
      ) : (
        <img
          className="hero-banner__image"
          src={movie.poster || movie.banner}
          alt=""
          aria-hidden="true"
        />
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

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}

export default HeroVideo;
