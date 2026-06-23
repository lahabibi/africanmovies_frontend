import { useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Film,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  Search,
  SearchX,
} from "lucide-react";
import AccountSidebar from "../components/account/AccountSidebar";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import { usePurchaseHistory } from "../hooks/usePayments";

const statusFilters = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

const HISTORY_RANGE_SIZE = 8;

function PurchaseHistory() {
  const historyQuery = usePurchaseHistory();
  const [activeStatus, setActiveStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState("");
  const [rangeIndex, setRangeIndex] = useState(0);
  const purchaseHistoryItems = useMemo(
    () => historyQuery.data?.items || [],
    [historyQuery.data?.items],
  );

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
    [purchaseHistoryItems],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return purchaseHistoryItems.filter((item) => {
      const matchesStatus =
        activeStatus === "all" ||
        getPaymentStatus(item).toLowerCase() === activeStatus;
      const searchText = `${item.movie.title} ${item.txRef}`.toLowerCase();
      return matchesStatus && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [activeStatus, purchaseHistoryItems, query]);

  const rangeOptions = useMemo(
    () => buildHistoryRanges(filteredItems.length),
    [filteredItems.length],
  );
  const selectedRangeIndex = Math.min(
    rangeIndex,
    Math.max(0, rangeOptions.length - 1),
  );
  const visibleItems = useMemo(() => {
    const start = selectedRangeIndex * HISTORY_RANGE_SIZE;
    return filteredItems.slice(start, start + HISTORY_RANGE_SIZE);
  }, [filteredItems, selectedRangeIndex]);

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
                    onClick={() => {
                      setActiveStatus(filter.id);
                      setExpandedId(null);
                      setRangeIndex(0);
                    }}
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
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setExpandedId(null);
                      setRangeIndex(0);
                    }}
                    placeholder="Search movie or reference..."
                    type="search"
                    value={query}
                  />
                  <Search aria-hidden="true" size={19} strokeWidth={1.8} />
                </label>

                <label className="purchase-history-sort">
                  <span className="sr-only">Select purchase history range</span>
                  <select
                    aria-label="Select purchase history range"
                    disabled={!rangeOptions.length}
                    onChange={(event) => {
                      setExpandedId(null);
                      setRangeIndex(Number(event.target.value));
                    }}
                    value={selectedRangeIndex}
                  >
                    {rangeOptions.length ? (
                      rangeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    ) : (
                      <option value="0">No items</option>
                    )}
                  </select>
                  <ChevronDown aria-hidden="true" size={18} strokeWidth={1.8} />
                </label>
              </div>
            </div>

            {historyQuery.isLoading ? (
              <PurchaseHistoryState
                icon={<LoaderCircle className="purchase-history-spinner" />}
                message="Gathering your transactions and movie access history."
                title="Loading purchase history"
              />
            ) : historyQuery.isError ? (
              <PurchaseHistoryState
                actions={
                  <button onClick={() => historyQuery.refetch()} type="button">
                    <RefreshCw aria-hidden="true" size={17} />
                    Try again
                  </button>
                }
                icon={<AlertCircle />}
                message="Your transactions could not be loaded right now."
                title="Purchase history unavailable"
                variant="error"
              />
            ) : visibleItems.length ? (
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
                <strong>
                  {purchaseHistoryItems.length
                    ? "No purchases found"
                    : "No purchase history yet"}
                </strong>
                <p>
                  {purchaseHistoryItems.length
                    ? "Try another search or payment status."
                    : "Completed and attempted purchases will appear here."}
                </p>
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
          {item.movie.posterUrl ? (
            <img src={item.movie.posterUrl} alt="" aria-hidden="true" />
          ) : (
            <span className="purchase-history-movie__placeholder" aria-hidden="true">
              <Film size={20} strokeWidth={1.5} />
            </span>
          )}
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

function PurchaseHistoryState({ actions, icon, message, title, variant = "default" }) {
  return (
    <div className={`purchase-history-empty purchase-history-empty--${variant}`}>
      {icon}
      <strong>{title}</strong>
      <p>{message}</p>
      {actions}
    </div>
  );
}

function getPaymentStatus(item) {
  return item.payment?.status || "Completed";
}

function buildHistoryRanges(totalItems) {
  return Array.from(
    { length: Math.ceil(totalItems / HISTORY_RANGE_SIZE) },
    (_, index) => {
      const start = index * HISTORY_RANGE_SIZE + 1;
      const end = Math.min(totalItems, start + HISTORY_RANGE_SIZE - 1);

      return {
        value: index,
        label: start === end ? String(start) : `${start} - ${end}`,
      };
    },
  );
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
