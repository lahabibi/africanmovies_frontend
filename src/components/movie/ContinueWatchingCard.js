import { Link } from "react-router-dom";
import playCircleIcon from "../../assets/icons/ic_play_button_circle.png";

function ContinueWatchingCard({ item }) {
  const detailsPath = `/movies/${item.slug}`;
  const resumePath = `${detailsPath}?watch=resume`;
  const description =
    item.description ||
    "Pick up from the exact moment you stopped and keep your access active while it lasts.";
  const accessLabel = item.accessTimeLabel || item.subtitle;
  const watchLabel =
    item.watchSummaryLabel || item.progressLabel || `${item.progress}% watched`;

  return (
    <article className="continue-card">
      <div className="continue-card__poster">
        <img src={item.thumbnail} alt="" aria-hidden="true" />
        {item.status === "expiring" ? (
          <span className="continue-card__badge">
            {item.statusLabel || "Expiring Soon"}
          </span>
        ) : null}
        <Link
          className="continue-card__tap-target"
          to={resumePath}
          aria-label={`Resume ${item.title}`}
        />
        <span className="continue-card__gradient" />

        <Link
          className="continue-card__play"
          to={resumePath}
          aria-label={`Resume ${item.title}`}
        >
          <img src={playCircleIcon} alt="" aria-hidden="true" />
        </Link>

        <span className="continue-card__copy">
          <strong>{item.title}</strong>
          {accessLabel ? <small>{accessLabel}</small> : null}
          <em>{watchLabel}</em>
        </span>

        <div className="continue-card__hover-panel">
          <strong>{item.title}</strong>
          <div className="continue-card__hover-meta">
            {accessLabel ? <span>{accessLabel}</span> : null}
            <span>{watchLabel}</span>
          </div>
          <p>{description}</p>
          <div className="continue-card__hover-actions">
            <Link className="continue-card__hover-primary" to={resumePath}>
              Resume
            </Link>
            <Link to={detailsPath}>Explore Story</Link>
          </div>
        </div>

        <span className="continue-card__track" aria-hidden="true">
          <span style={{ width: `${item.progress}%` }} />
        </span>
      </div>
    </article>
  );
}

export default ContinueWatchingCard;
