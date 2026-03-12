import SiteHeader from "./components/SiteHeader";
import HeroBanner from "./components/HeroBanner";
import WatchSection from "./components/WatchSection";
import CookieSettingsLink from "./components/CookieSettingsLink";
import SectionDivider from "./components/SectionDivider";
import TheBandSection from "./components/TheBandSection";
import ServicesSection from "./components/ServicesSection";
import ReviewsSection from "./components/ReviewsSection";
import ContactFaqSection from "./components/ContactFaqSection";
import { homepageContent } from "./lib/homepage-content";
import { getSiteNavLayoutMode } from "./lib/site-content";

export const dynamic = "force-dynamic";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/skaraceilidhband",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M13.5 8.5V6.9c0-.9.2-1.4 1.5-1.4H17V2.8c-.4-.1-1.7-.2-3.2-.2-3.1 0-5.2 1.9-5.2 5.4v1.5H6v3.2h2.6v8.7h3.8v-8.7h3l.5-3.2h-3.5Z"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/skaraceilidhband/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.8 1.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@skaraceilidhband2929",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M21.8 8.1a3 3 0 0 0-2.1-2.1C17.9 5.5 12 5.5 12 5.5s-5.9 0-7.7.5A3 3 0 0 0 2.2 8.1c-.5 1.8-.5 3.9-.5 3.9s0 2.1.5 3.9a3 3 0 0 0 2.1 2.1c1.8.5 7.7.5 7.7.5s5.9 0 7.7-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-3.9.5-3.9s0-2.1-.5-3.9ZM10.1 15.3V8.7l5.7 3.3-5.7 3.3Z"
        />
      </svg>
    ),
  },
];

export default async function Home() {
  const navLayoutMode = await getSiteNavLayoutMode();

  return (
    <div id="top" className="min-h-screen bg-[#061a2b] text-white">
      <SiteHeader defaultNavLayoutMode={navLayoutMode} />

      <main className="flex w-full flex-1 flex-col">
        <HeroBanner />
        <SectionDivider className="py-6 md:py-8" />

        <TheBandSection content={homepageContent.theBand} />
        <SectionDivider className="py-6 md:py-8" />

        <WatchSection content={homepageContent.media} />
        <SectionDivider className="py-6 md:py-8" />

        <ServicesSection content={homepageContent.services} />
        <SectionDivider className="py-6 md:py-8" />

        <ReviewsSection reviews={homepageContent.reviews} />
        <SectionDivider className="py-6 md:py-8" />

        <ContactFaqSection contact={homepageContent.contact} faqs={homepageContent.faqs} />
      </main>

      <footer className="border-t border-white/20 px-6 py-10 text-center sm:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-white/65">Skara Ceilidh Band</p>
        <p className="mt-3 text-white/80">
          For bookings and enquiries, email{" "}
          <a className="underline decoration-white/60 underline-offset-4 hover:text-white" href="mailto:info@skaraceilidh.com">
            info@skaraceilidh.com
          </a>
        </p>
        <CookieSettingsLink />
        <div className="mt-6 flex items-center justify-center gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit Skara on ${social.name}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white/85 transition hover:border-[#cba454] hover:text-[#cba454]"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
