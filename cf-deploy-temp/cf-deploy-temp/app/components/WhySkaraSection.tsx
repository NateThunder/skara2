const features = [
  {
    title: "Dancefloor energy",
    description: "Lively sets that keep people moving from first circle to last chorus.",
  },
  {
    title: "Crisp sound, any room",
    description: "A clean mix and confident delivery that fits both intimate spaces and big venues.",
  },
  {
    title: "Easy to book",
    description: "Check availability, share your details, and we will confirm the plan quickly.",
  },
];

export default function WhySkaraSection() {
  return (
    <section className="why-section" aria-label="Why Skara">
      <div className="why-section__inner">
        <p className="why-section__eyebrow">Why Skara</p>
        <h2 className="why-section__title">A premium, modern ceilidh experience.</h2>
        <p className="why-section__subtitle">
          Built for momentum: smooth flow, strong dynamics, and a clear plan from enquiry to
          encore.
        </p>

        <div className="why-grid">
          {features.map((feature) => (
            <article key={feature.title} className="why-card">
              <h3 className="why-card__title" style={{ color: "#cba454" }}>
                {feature.title}
              </h3>
              <p className="why-card__text">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
