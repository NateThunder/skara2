import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden md:h-screen" aria-label="Hero banner video">
      <video
        className="hero-video absolute inset-0"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/thumbnail.png"
      >
        <source media="(min-width: 768px)" src="/hero-strip-the-willow-1080p.mp4" type="video/mp4" />
        <source src="/hero-strip-the-willow-720p.mp4" type="video/mp4" />
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
    </section>
  );
}
