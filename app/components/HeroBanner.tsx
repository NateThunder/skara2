"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function HeroBanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMuted = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
      });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden" aria-label="Hero banner video">
      <video
        ref={videoRef}
        className="hero-video absolute inset-0"
        src="/hero-strip-the-willow.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/25"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] items-center px-6 pt-14 md:px-12 md:pt-16 lg:pt-20">
        <div className="hero-content pointer-events-auto max-w-[760px]">
          <p className="hero-eyebrow">Ceilidh Band . Scotland</p>
          <Image
            src="/logo white.png"
            alt="Skara Ceilidh Band"
            width={540}
            height={170}
            priority
            className="hero-brand"
          />
          <p className="hero-description">
            High-energy ceilidh sets with a modern edge designed for packed dance floors.
          </p>
          <div className="hero-actions">
            <a
              href="#bookings"
              className="hero-btn hero-btn--primary"
              data-track-button="true"
              data-track-label="Check availability"
            >
              Check Availability
            </a>
            <a
              href="#watch"
              className="hero-btn hero-btn--secondary"
              data-track-button="true"
              data-track-label="Watch highlights"
            >
              Watch Highlights
            </a>
          </div>
          <p className="hero-instruments">Fiddle . Pipes . Guitar . Drums</p>
        </div>
      </div>

      <button
        type="button"
        className="hero-sound-toggle"
        aria-pressed={!isMuted}
        aria-label={isMuted ? "Unmute banner video" : "Mute banner video"}
        onClick={toggleMuted}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="hero-sound-toggle__icon"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 8L8.7 10H6V14H8.7L11 16V8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {isMuted ? (
            <>
              <path d="M15 10.5L19 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M19 10.5L15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M15 10C16 10.8 16 13.2 15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M17.8 8.8C19.8 10.6 19.8 13.4 17.8 15.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </>
          )}
        </svg>
        <span>{isMuted ? "Sound Off" : "Sound On"}</span>
      </button>
    </section>
  );
}
