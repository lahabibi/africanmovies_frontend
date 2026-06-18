import { AlertCircle, LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

function TrailerModal({
  error,
  isLoading,
  movie,
  onClose,
  source,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const title = movie?.title ? `${movie.title} Trailer` : "Movie Trailer";
  const poster = movie?.poster || movie?.banner;

  return createPortal(
    <div
      className="trailer-modal"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        aria-label={title}
        aria-modal="true"
        className="trailer-modal__dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="trailer-modal__header">
          <div>
            <span>Now Playing</span>
            <h2>{title}</h2>
          </div>

          <button
            aria-label="Close trailer"
            className="trailer-modal__close"
            onClick={onClose}
            type="button"
          >
            <span>Close</span>
            <X aria-hidden="true" size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="trailer-modal__stage">
          {isLoading ? (
            <div className="trailer-modal__state">
              <LoaderCircle aria-hidden="true" className="trailer-modal__spin" />
              <p>Loading trailer...</p>
            </div>
          ) : source ? (
            source.type === "video" ? (
              <video
                autoPlay
                className="trailer-modal__media"
                controls
                playsInline
                poster={poster}
                src={source.src}
              />
            ) : (
              <iframe
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
                className="trailer-modal__media"
                src={source.src}
                title={title}
              />
            )
          ) : (
            <div className="trailer-modal__state trailer-modal__state--error">
              <AlertCircle aria-hidden="true" size={28} strokeWidth={1.8} />
              <div>
                <p>Trailer unavailable</p>
                <span>
                  {error?.message ||
                    "We could not load this trailer right now."}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default TrailerModal;
