import { ArrowRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";

const seatRows = [6, 7, 8];

function NotFound() {
  return (
    <AppShell>
      <main className="not-found-page">
        <div className="not-found-page__scene" aria-hidden="true">
          <span className="not-found-page__curtain not-found-page__curtain--left" />
          <span className="not-found-page__curtain not-found-page__curtain--right" />
          <div className="not-found-page__screen">
            <span>404</span>
            <i />
            <i />
          </div>
          <div className="not-found-page__seats">
            {seatRows.map((seatCount, rowIndex) => (
              <div key={seatCount} style={{ "--seat-row": rowIndex }}>
                {Array.from({ length: seatCount }, (_, seatIndex) => (
                  <span key={seatIndex} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <section
          className="not-found-page__content"
          aria-labelledby="not-found-title"
        >
          <p>404 - Scene unavailable</p>
          <h1 id="not-found-title">This page doesn't exist.</h1>
          <span>
            The page may have moved, or the link may no longer be available.
          </span>
          <div className="not-found-page__actions">
            <Link className="button button--primary" to="/">
              <Compass aria-hidden="true" size={19} strokeWidth={1.9} />
              Browse Movies
            </Link>
            <Link className="button button--ghost" to="/genres">
              Explore Genres
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.9} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

export default NotFound;
