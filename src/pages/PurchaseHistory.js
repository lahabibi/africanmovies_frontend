import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ReceiptText,
  Search,
  SearchX,
} from "lucide-react";
import AccountSidebar from "../components/account/AccountSidebar";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import { purchaseHistoryItems } from "../data/purchaseHistoryData";

const statusFilters = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "title", label: "Title A-Z" },
];

function PurchaseHistory() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const statusCounts = useMemo(
    () =>
      purchaseHistoryItems.reduce(
        (counts, item) => {
          const status = getPaymentStatus(item).toLowerCase();
          counts.all += 1;
          counts[status] = (counts[status] || 0) + 1;
          return counts;
        },
        { all: 0, completed: 0, pending: 0, failed: 0 },
      ),
    [],
  );

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchingItems = purchaseHistoryItems.filter((item) => {
      const matchesStatus =
        activeStatus === "all" ||
        getPaymentStatus(item).toLowerCase() === activeStatus;
      const searchText = `${item.movie.title} ${item.txRef}`.toLowerCase();
      return matchesStatus && (!normalizedQuery || searchText.includes(normalizedQuery));
    });

    return [...matchingItems].sort((firstItem, secondItem) => {
      if (sortBy === "title") {
        return firstItem.movie.title.localeCompare(secondItem.movie.title);
      }
      return new Date(secondItem.createdAt) - new Date(firstItem.createdAt);
    });
  }, [activeStatus, query, sortBy]);

  return (
    <AppShell>
      <main className="profile-page purchase-history-page">
        <AccountSidebar
          activeId="purchase-history"
          ariaLabel="Purchase history navigation"
        />

        <section
          className="profile-content purchase-history-content"
          aria-labelledby="purchase-history-title"
        >
          <header className="profile-heading purchase-history-heading">
            <h1 id="purchase-history-title">Purchase History</h1>
            <p>Review your movie purchases, payment status, and access history.</p>
          </header>

          <section
            className="profile-panel purchase-history-panel"
            aria-label="Purchase transactions"
          >
            <div className="purchase-history-controls">
              <div
                className="purchase-history-tabs"
                role="tablist"
                aria-label="Payment status"
              >
                {statusFilters.map((filter) => (
                  <button
                    aria-selected={activeStatus === filter.id}
                    className={activeStatus === filter.id ? "is-active" : undefined}
                    key={filter.id}
                    onClick={() => setActiveStatus(filter.id)}
                    role="tab"
                    type="button"
                  >
                    {filter.label}
                    <span>{statusCounts[filter.id]}</span>
                  </button>
                ))}
              </div>

              <div className="purchase-history-toolbar">
                <label className="purchase-history-search">
                  <span className="sr-only">Search purchase history</span>
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search movie or reference..."
                    type="search"
                    value={query}
                  />
                  <Search aria-hidden="true" size={19} strokeWidth={1.8} />
                </label>

                <label className="purchase-history-sort">
                  <span className="sr-only">Sort purchase history</span>
                  <select
                    aria-label="Sort purchase history"
                    onChange={(event) => setSortBy(event.target.value)}
                    value={sortBy}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden="true" size={18} strokeWidth={1.8} />
                </label>
              </div>
            </div>

            {visibleItems.length ? (
              <div className="purchase-history-list">
                <div className="purchase-history-list__header" aria-hidden="true">
                  <span>Movie</span>
                  <span>Date &amp; reference</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span />
                </div>

                {visibleItems.map((item) => (
                  <PurchaseHistoryRow
                    expanded={expandedId === item.id}
                    item={item}
                    key={item.id}
                    onToggle={() =>
                      setExpandedId((currentId) =>
                        currentId === item.id ? null : item.id,
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="purchase-history-empty">
                <SearchX aria-hidden="true" size={32} strokeWidth={1.5} />
                <strong>No purchases found</strong>
                <p>Try another search or payment status.</p>
              </div>
            )}
          </section>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function PurchaseHistoryRow({ expanded, item, onToggle }) {
  const paymentStatus = getPaymentStatus(item);
  const accessLabel = getAccessLabel(item.accessStatus);

  return (
    <article className={`purchase-history-row${expanded ? " is-expanded" : ""}`}>
      <div className="purchase-history-row__summary">
        <div className="purchase-history-movie">
          <img src={item.movie.posterUrl} alt="" aria-hidden="true" />
          <span>
            <strong>{item.movie.title}</strong>
            <small>{item.payment?.paymentMethod || "Free movie claim"}</small>
          </span>
        </div>

        <div className="purchase-history-reference">
          <small>{formatDate(item.createdAt)}</small>
          <code>{item.txRef}</code>
        </div>

        <strong className="purchase-history-amount">
          {item.payment
            ? formatPrice(item.payment.amount, item.payment.currency)
            : "Free"}
        </strong>

        <div className="purchase-history-statuses">
          <span
            className={`purchase-status purchase-status--${paymentStatus.toLowerCase()}`}
          >
            {paymentStatus}
          </span>
          <small>{accessLabel}</small>
        </div>

        <button
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "View"} details for ${item.movie.title}`}
          className="purchase-history-row__toggle"
          onClick={onToggle}
          title="Transaction details"
          type="button"
        >
          <ChevronRight aria-hidden="true" size={20} strokeWidth={1.9} />
        </button>
      </div>

      {expanded ? (
        <div className="purchase-history-row__details">
          <span>
            <small>Transaction ID</small>
            <strong>{item.payment?.transactionId || "Not available"}</strong>
          </span>
          <span>
            <small>Payment method</small>
            <strong>{item.payment?.paymentMethod || "Free claim"}</strong>
          </span>
          <span>
            <small>Movie access</small>
            <strong>{accessLabel}</strong>
          </span>
          <ReceiptText aria-hidden="true" size={22} strokeWidth={1.6} />
        </div>
      ) : null}
    </article>
  );
}

function getPaymentStatus(item) {
  return item.payment?.status || "Completed";
}

function getAccessLabel(status) {
  if (status === "active") return "Access active";
  if (status === "expired") return "Access expired";
  if (status === "pending") return "Awaiting confirmation";
  return "No access granted";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPrice(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
  }).format(amount);
}

export default PurchaseHistory;
