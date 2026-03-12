"use client";

import { useEffect, useState } from "react";

import type { Review } from "@/app/lib/homepage-content";

type ReviewsSectionProps = {
  reviews: Review[];
};

const AUTOPLAY_INTERVAL_MS = 6000;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const points = direction === "left" ? "15 6 9 12 15 18" : "9 6 15 12 9 18";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2.6 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-2.9-5.6 2.9 1.1-6.3-4.6-4.5 6.3-.9L12 2.6Z" />
    </svg>
  );
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const totalReviews = reviews.length;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);

      return () => {
        mediaQuery.removeEventListener("change", updatePreference);
      };
    }

    mediaQuery.addListener(updatePreference);

    return () => {
      mediaQuery.removeListener(updatePreference);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || totalReviews < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % totalReviews);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeIndex, prefersReducedMotion, totalReviews]);

  if (totalReviews === 0) {
    return null;
  }

  const normalizedActiveIndex = activeIndex % totalReviews;
  const activeReview = reviews[normalizedActiveIndex];
  const mergedQuote = activeReview.quote.join(" ");

  const showPreviousReview = () => {
    if (totalReviews < 2) {
      return;
    }

    setActiveIndex((previous) => (previous - 1 + totalReviews) % totalReviews);
  };

  const showNextReview = () => {
    if (totalReviews < 2) {
      return;
    }

    setActiveIndex((previous) => (previous + 1) % totalReviews);
  };

  return (
    <section id="reviews" className="reviews-section" aria-label="Reviews">
      <div className="reviews-section__inner">
        <h2 className="reviews-section__title">What our clients say.</h2>

        <div className="reviews-section__carousel" aria-roledescription="carousel" aria-label="Client testimonials">
          <button
            type="button"
            className="reviews-section__arrow"
            onClick={showPreviousReview}
            aria-label="Show previous testimonial"
            disabled={totalReviews < 2}
          >
            <ChevronIcon direction="left" />
          </button>

          <article key={activeReview.id} className="reviews-section__slide" aria-live="polite" aria-atomic="true">
            <div className="reviews-section__stars" role="img" aria-label="Five star review">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={`star-${index}`} className="reviews-section__star">
                  <StarIcon />
                </span>
              ))}
            </div>

            <blockquote className="reviews-section__quote">
              <p>&quot;{mergedQuote}&quot;</p>
            </blockquote>

            <p className="reviews-section__author">{activeReview.author}</p>

            <div className="reviews-section__dots" aria-label="Testimonial navigation">
              {reviews.map((review, index) => (
                <button
                  key={review.id}
                  type="button"
                  className="reviews-section__dot"
                  aria-label={`Show testimonial ${index + 1}`}
                  aria-current={index === normalizedActiveIndex ? "true" : undefined}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </article>

          <button
            type="button"
            className="reviews-section__arrow"
            onClick={showNextReview}
            aria-label="Show next testimonial"
            disabled={totalReviews < 2}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}
