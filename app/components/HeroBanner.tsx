"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function HeroBanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const shouldMute = !isMuted;
    video.muted = shouldMute;
    setIsMuted(shouldMute);

    if (!shouldMute) {
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
      });
    }
  };

  return (
    <section className="relative h-[100svh] w-full overflow-hidden md:h-screen" aria-label="Hero banner video">
      <video
        ref={videoRef}
        className="hero-video absolute inset-0"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        poster="/thumbnail.png"
      >
        <source
          media="(min-width: 768px)"
          src="https://pub-9be083b820034f6ca6f0848c01c0eae9.r2.dev/hero-strip-the-willow-no-first-2-frames.mp4"
          type="video/mp4"
        />
        <source src="/hero-strip-the-willow-full-720p.mp4" type="video/mp4" />
      </video>
      <div className="hero-scrim pointer-events-none absolute inset-0" aria-hidden="true" />

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
              href="#contact"
              className="hero-btn hero-btn--primary"
              data-track-button="true"
              data-track-label="Check Availability"
            >
              Book Now
            </a>
            <a
              href="#media"
              className="hero-btn hero-btn--secondary"
              data-track-button="true"
              data-track-label="View Media"
            >
              Media
            </a>
          </div>
          <p className="hero-instruments">Fiddle . Pipes . Guitar . Drums</p>
        </div>
      </div>

      <button
        type="button"
        className="hero-sound-toggle"
        onClick={toggleSound}
        aria-pressed={!isMuted}
        aria-label={isMuted ? "Unmute hero video" : "Mute hero video"}
      >
        <svg viewBox="0 0 24 24" className="hero-sound-toggle__icon" aria-hidden="true">
          {isMuted ? (
            <>
              <path
                d="M5 9v6h4l5 4V5l-5 4H5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.2 9.2 20.8 13.8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.8 9.2 16.2 13.8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <>
              <path
                d="M5 9v6h4l5 4V5l-5 4H5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.5 9.2a4.5 4.5 0 0 1 0 5.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>
        <span className="hero-sound-toggle__label">{isMuted ? "Sound Off" : "Sound On"}</span>
      </button>
    </section>
  );
}
