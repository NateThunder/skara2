import type { Mention } from "@/app/lib/site-content";

type MentionsSectionProps = {
  mentions: Mention[];
};

export default function MentionsSection({ mentions }: MentionsSectionProps) {
  return (
    <section id="mentions" className="mentions-section" aria-label="Mentions">
      <div className="mentions-section__inner">
        <p className="mentions-section__eyebrow">Mentions</p>
        <h2 className="mentions-section__title">What people say.</h2>
        <p className="mentions-section__subtitle">
          Public write-ups and event listings mentioning Skara.
        </p>

        <div className="mentions-grid">
          {mentions.map((mention) => (
            <article key={mention.id} className="mentions-card">
              <p className="mentions-card__quote">{mention.quote}</p>
              {mention.url ? (
                <a
                  className="mentions-card__source"
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mention.source}
                </a>
              ) : (
                <p className="mentions-card__source">{mention.source}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
