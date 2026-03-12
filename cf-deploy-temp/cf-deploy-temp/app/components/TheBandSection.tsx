import Image from "next/image";
import type { TheBandContent } from "@/app/lib/homepage-content";

type TheBandSectionProps = {
  content: TheBandContent;
};

export default function TheBandSection({ content }: TheBandSectionProps) {
  return (
    <section id="the-band" className="the-band-section" aria-label="The Band">
      <div className="the-band-section__inner">
        <div className="the-band-section__content">
          <p className="the-band-section__eyebrow">{content.eyebrow}</p>
          <h2 className="the-band-section__title">{content.heading}</h2>
          <div className="the-band-section__copy">
            {content.paragraphs.map((paragraph, index) => (
              <p key={`${content.heading}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="the-band-section__media">
          <Image
            src={content.imageSrc}
            alt={content.imageAlt}
            width={1200}
            height={900}
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="the-band-section__image"
          />
        </div>
      </div>
    </section>
  );
}
