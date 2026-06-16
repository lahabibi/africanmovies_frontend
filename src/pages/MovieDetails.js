import { Link, useParams } from "react-router-dom";
import { Heart, Play, TvMinimalPlay } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import ContentRow from "../components/movie/ContentRow";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import audioIcon from "../assets/icons/ic_audio.png";
import castIcon from "../assets/icons/ic_cast.png";
import languageIcon from "../assets/icons/ic_language.png";
import likeIcon from "../assets/icons/ic_like.png";
import productionIcon from "../assets/icons/ic_production.png";
import releaseYearIcon from "../assets/icons/ic_release_year.png";
import starIcon from "../assets/icons/ic_star.png";
import watchlistIcon from "../assets/icons/ic_watchlist.png";
import {
  defaultMovieDetail,
  movieDetailsBySlug,
} from "../data/movieDetailsData";

const aboutFieldIcons = {
  cast: castIcon,
  language: languageIcon,
  audio: audioIcon,
  releaseYear: releaseYearIcon,
  production: productionIcon,
};

const aboutFieldLabels = {
  cast: "Cast",
  language: "Language",
  audio: "Audio",
  releaseYear: "Release Year",
  production: "Production",
};

const aboutFieldOrder = [
  "cast",
  "language",
  "audio",
  "releaseYear",
  "production",
];

function MovieDetails() {
  const { slug } = useParams();
  const movie = movieDetailsBySlug[slug] || defaultMovieDetail;
  const heroMovie = movie.heroMovie || { mode: "image", banner: movie.banner };
  const priceLabel = `$${movie.price.toFixed(2)}`;

  return (
    <AppShell>
      <main className="movie-detail-page">
        <section
          className="movie-detail-hero"
          aria-labelledby="movie-detail-title"
        >
          {heroMovie.mode === "video" && heroMovie.videoSrc ? (
            <video
              className="movie-detail-hero__video"
              autoPlay
              loop
              muted
              playsInline
              poster={heroMovie.poster || movie.banner}
              src={heroMovie.videoSrc}
            />
          ) : (
            <img
              className="movie-detail-hero__image"
              src={heroMovie.banner || movie.banner}
              alt=""
              aria-hidden="true"
            />
          )}
          <span className="movie-detail-hero__shade" aria-hidden="true" />

          <div className="movie-detail-hero__content">
            <h1 id="movie-detail-title">{movie.title}</h1>

            <div className="movie-detail-hero__meta" aria-label="Movie details">
              <span>{movie.year}</span>
              <span>{movie.genres.join(", ")}</span>
              <span>{movie.duration}</span>
              <span className="movie-detail-hero__rating">
                <img src={starIcon} alt="" aria-hidden="true" />
                {movie.rating}
              </span>
              <span className="movie-detail-badge">{movie.maturityRating}</span>
              {/* <span className="movie-detail-badge">{movie.quality}</span> */}
            </div>

            <p>{movie.description}</p>

            <div className="movie-detail-actions">
              <Link
                className="button button--primary"
                to={`/movies/${movie.slug}?watch=now`}
              >
                <Play aria-hidden="true" size={19} fill="currentColor" />
                Watch Now {priceLabel}
              </Link>

              <Link
                className="button button--ghost"
                to={`/movies/${movie.slug}?trailer=true`}
              >
                <TvMinimalPlay aria-hidden="true" size={21} strokeWidth={1.9} />
                Watch Trailer
              </Link>

              <button className="movie-detail-icon-action" type="button">
                <span>
                  <Heart aria-hidden="true" size={25} strokeWidth={1.8} />
                </span>
                Like
              </button>

              <button className="movie-detail-icon-action" type="button">
                <span>
                  <img src={likeIcon} alt="" aria-hidden="true" />
                </span>
                Add to Watchlist
              </button>
            </div>
          </div>
        </section>

        <section className="movie-detail-body">
          <div
            className="movie-detail-tabs"
            role="tablist"
            aria-label="Movie sections"
          >
            <button
              className="is-active"
              type="button"
              role="tab"
              aria-selected="true"
            >
              About
            </button>
            <button type="button" role="tab" aria-selected="false">
              Cast & Crew
            </button>
            <button type="button" role="tab" aria-selected="false">
              More Like This
            </button>
          </div>

          <div className="movie-detail-about">
            <dl className="movie-detail-facts">
              {aboutFieldOrder.map((field) => (
                <div className="movie-detail-fact" key={field}>
                  <dt>
                    <img
                      src={aboutFieldIcons[field]}
                      alt=""
                      aria-hidden="true"
                    />
                    {aboutFieldLabels[field]}
                  </dt>
                  <dd>{movie.about[field]}</dd>
                </div>
              ))}
            </dl>

            <div className="movie-detail-synopsis">
              <p>{movie.synopsis}</p>
              <div className="movie-detail-tags" aria-label="Tags">
                {movie.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="movie-detail-stats" aria-label="Audience activity">
              <StatBlock
                icon={likeIcon}
                label="Likes"
                value={movie.stats.likes}
                note="People who love this movie"
              />
              <StatBlock
                icon={watchlistIcon}
                label="Watchlist"
                value={movie.stats.watchlist}
                note="People added this to their watchlist"
              />
            </div>
          </div>

          <div className="movie-detail-more">
            <ContentRow title="More Like This" viewAllTo="/movies">
              {movie.moreLikeThis.map((relatedMovie) => (
                <MoviePosterCard
                  key={relatedMovie.id}
                  movie={relatedMovie}
                  showMeta={false}
                />
              ))}
            </ContentRow>
          </div>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function StatBlock({ icon, label, note, value }) {
  return (
    <div className="movie-detail-stat">
      <img src={icon} alt="" aria-hidden="true" />
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{note}</small>
    </div>
  );
}

export default MovieDetails;
