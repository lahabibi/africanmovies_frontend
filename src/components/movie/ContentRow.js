import { Children, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import leftChevron from "../../assets/icons/ic_left_chevron.png";
import rightChevron from "../../assets/icons/ic_right_chevron.png";

function ContentRow({ title, children, className = "", viewAllTo = "/movies" }) {
  const scrollerRef = useRef(null);
  const childCount = Children.count(children);
  const titleId = `${title.replace(/\s+/g, "-").toLowerCase()}-title`;
  const scrollerId = `${titleId}-scroller`;
  const [scrollState, setScrollState] = useState({
    canScrollPrev: false,
    canScrollNext: false,
  });

  const updateScrollState = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    const canScrollPrev = scroller.scrollLeft > 2;
    const canScrollNext = scroller.scrollLeft < maxScrollLeft - 2;

    setScrollState((currentState) => {
      if (
        currentState.canScrollPrev === canScrollPrev &&
        currentState.canScrollNext === canScrollNext
      ) {
        return currentState;
      }

      return { canScrollPrev, canScrollNext };
    });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return undefined;
    }

    updateScrollState();

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateScrollState);

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    resizeObserver?.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [childCount, updateScrollState]);

  const scrollRow = (direction) => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const firstItem = scroller.firstElementChild;
    const itemWidth = firstItem?.getBoundingClientRect().width ?? 0;
    const gap = parseFloat(window.getComputedStyle(scroller).gap) || 0;
    const scrollAmount = itemWidth
      ? Math.max(itemWidth + gap, scroller.clientWidth - itemWidth - gap)
      : scroller.clientWidth * 0.8;

    scroller.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      className={["content-row", className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <div className="content-row__header">
        <h2 id={titleId}>{title}</h2>
        <div className="content-row__actions">
          <Link to={viewAllTo}>View All</Link>
          <button
            type="button"
            aria-controls={scrollerId}
            aria-label={`Previous ${title}`}
            disabled={!scrollState.canScrollPrev}
            onClick={() => scrollRow(-1)}
          >
            <img src={leftChevron} alt="" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-controls={scrollerId}
            aria-label={`Next ${title}`}
            disabled={!scrollState.canScrollNext}
            onClick={() => scrollRow(1)}
          >
            <img src={rightChevron} alt="" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="content-row__scroller" id={scrollerId} ref={scrollerRef}>
        {children}
      </div>
    </section>
  );
}

export default ContentRow;
