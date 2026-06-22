import { ChevronDown, LockKeyhole, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import { getAuthToken } from "../api/authToken";
import { useLibrary } from "../hooks/useOrders";

const librarySectionConfig = [
  {
    id: "active",
    title: "Active Access",
    description: "You have access to watch these titles.",
  },
  {
    id: "expiring",
    title: "Expiring Soon",
    description: "These titles will expire within the next 48 hours.",
  },
  {
    id: "expired",
    title: "Expired",
    description: "These titles are no longer available.",
  },
];

const librarySortOptions = [
  { value: "recent", label: "Recently Purchased" },
  { value: "title", label: "Title A-Z" },
];

function Library() {
  const location = useLocation();
  const libraryQuery = useLibrary();
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const items = useMemo(
    () => libraryQuery.data?.items || [],
    [libraryQuery.data?.items],
  );

  const sections = useMemo(
    () =>
      librarySectionConfig.map((section) => {
        const sectionItems = items.filter((item) => item.status === section.id);
        return {
          ...section,
          count: sectionItems.length,
          items: sectionItems,
        };
      }),
    [items],
  );

  const libraryTabs = useMemo(() => {
    const counts = {
      all: items.length,
      active: items.filter((item) => item.status !== "expired").length,
      expiring: items.filter((item) => item.status === "expiring").length,
      expired: items.filter((item) => item.status === "expired").length,
    };

    return [
      { id: "all", label: "All", count: counts.all },
      { id: "active", label: "Active", count: counts.active },
      { id: "expiring", label: "Expiring Soon", count: counts.expiring },
      { id: "expired", label: "Expired", count: counts.expired },
    ];
  }, [items]);

  const visibleSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sectionIds = getSectionIdsForTab(activeTab);

    return sectionIds
      .map((sectionId) => {
        const section = sections.find((item) => item.id === sectionId);
        const items = section.items
          .filter((item) =>
            normalizedQuery ? item.title.toLowerCase().includes(normalizedQuery) : true
          )
          .sort((firstItem, secondItem) => sortLibraryItems(firstItem, secondItem, sortBy));

        return { ...section, items };
      })
      .filter((section) => section.items.length > 0);
  }, [activeTab, query, sections, sortBy]);

  const hasResults = visibleSections.length > 0;

  if (!getAuthToken()) {
    return <Navigate replace state={{ from: location.pathname }} to="/signin" />;
  }

  return (
    <AppShell>
      <main className="library-page">
        <section className="library-hero" aria-labelledby="library-title">
          <h1 id="library-title">My Library</h1>
          <p>Movies and shows you've purchased. Access them anytime, anywhere.</p>
        </section>

        <section className="library-controls" aria-label="Library controls">
          <div className="library-tabs" role="tablist" aria-label="Library filters">
            {libraryTabs.map((tab) => (
              <button
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? "is-active" : undefined}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.id === "all" ? tab.label : `${tab.label} (${tab.count})`}
              </button>
            ))}
          </div>

          <div className="library-toolbar">
            <label className="library-search">
              <span className="sr-only">Search in my library</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search in my library..."
                type="search"
                value={query}
              />
              <Search aria-hidden="true" size={21} strokeWidth={1.8} />
            </label>

            <label className="library-sort">
              <span>Sort by:</span>
              <select
                aria-label="Sort library"
                onChange={(event) => setSortBy(event.target.value)}
                value={sortBy}
              >
                {librarySortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" size={18} strokeWidth={1.9} />
            </label>
          </div>
        </section>

        {libraryQuery.isLoading ? (
          <div className="library-empty">
            <strong>Loading your library</strong>
            <p>Gathering your purchased movies and viewing progress.</p>
          </div>
        ) : libraryQuery.isError ? (
          <div className="library-empty">
            <strong>Your library is unavailable</strong>
            <p>Please try again in a moment.</p>
            <button onClick={() => libraryQuery.refetch()} type="button">
              Try again
            </button>
          </div>
        ) : hasResults ? (
          visibleSections.map((section) => (
            <LibrarySection section={section} key={section.id} variant={section.id} />
          ))
        ) : (
          <div className="library-empty">
            <strong>{items.length ? "No titles found" : "Your library is empty"}</strong>
            <p>
              {items.length
                ? "Try a different search or switch to another library tab."
                : "Movies you purchase or claim will appear here."}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </AppShell>
  );
}

function getSectionIdsForTab(activeTab) {
  if (activeTab === "all") {
    return librarySectionConfig.map((section) => section.id);
  }

  if (activeTab === "active") {
    return ["active", "expiring"];
  }

  return [activeTab];
}

function sortLibraryItems(firstItem, secondItem, sortBy) {
  if (sortBy === "title") {
    return firstItem.title.localeCompare(secondItem.title);
  }

  return new Date(secondItem.purchasedAt) - new Date(firstItem.purchasedAt);
}

function LibrarySection({ section, variant }) {
  return (
    <section className="library-section" aria-labelledby={`${section.id}-title`}>
      <div className="library-section__heading">
        <h2 id={`${section.id}-title`}>
          {section.title} ({section.count})
        </h2>
        <p>{section.description}</p>
      </div>

      <div className={`library-grid library-grid--${variant}`}>
        {section.items.map((item) => (
          <LibraryMovieCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function LibraryMovieCard({ item }) {
  const isExpired = item.status === "expired";
  const watchIntent = item.playbackCompleted ? "now" : "resume";
  const activeActionLabel = item.playbackCompleted ? "Watch Again" : "Resume";
  const expiredActionLabel = item.price
    ? `Watch Again ${formatPrice(item.price, item.currency)}`
    : "Watch Again";

  return (
    <article className={`library-card library-card--${item.status}`}>
      <div className="library-card__media">
        <img src={item.image} alt="" aria-hidden="true" />
        <span className="library-card__shade" />
        <Link
          className="library-card__tap-target"
          to={`/movies/${item.slug}${
            isExpired ? "" : `?watch=${watchIntent}`
          }`}
          aria-label={`${isExpired ? "View" : activeActionLabel} ${item.title}`}
        />
        {isExpired ? (
          <span className="library-card__lock" aria-hidden="true">
            <LockKeyhole size={20} strokeWidth={1.9} />
          </span>
        ) : null}
        <span className="library-card__badge">{item.statusLabel}</span>
        <span className="library-card__content">
          <strong>{item.title}</strong>
          <small>{item.timeLabel}</small>
        </span>
        {isExpired ? (
          <Link className="library-card__action" to={`/movies/${item.slug}?watch=now`}>
            {expiredActionLabel}
          </Link>
        ) : null}
        {!isExpired ? (
          <span className="library-card__progress" aria-hidden="true">
            <span style={{ width: `${item.progress}%` }} />
          </span>
        ) : null}
      </div>
    </article>
  );
}

function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

export default Library;
