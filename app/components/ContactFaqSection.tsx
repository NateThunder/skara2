"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { ContactContent, FaqItem } from "@/app/lib/homepage-content";

type ContactFaqSectionProps = {
  contact: ContactContent;
  faqs: FaqItem[];
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatISODateLocal(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseISODateLocal(isoDate: string): Date | null {
  const [year, month, day] = isoDate.split("-").map((value) => Number(value));
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function ContactFaqSection({ contact, faqs }: ContactFaqSectionProps) {
  const formName = "booking-enquiry";
  const today = useMemo(() => startOfTodayLocal(), []);
  const todayISO = useMemo(() => formatISODateLocal(today), [today]);

  const [selectedISO, setSelectedISO] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function isPastISO(isoDate: string): boolean {
    const date = parseISODateLocal(isoDate);
    if (!date) {
      return false;
    }

    return date.getTime() < today.getTime();
  }

  function onDateInput(nextISO: string): void {
    if (!nextISO) {
      setNotice(null);
      setSelectedISO("");
      return;
    }

    if (isPastISO(nextISO)) {
      setNotice("Please choose today or a future date.");
      return;
    }

    setNotice(null);
    setSelectedISO(nextISO);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !selectedISO) {
      setNotice("Add your name, email, and event date to send an enquiry.");
      return;
    }

    if (botField) {
      return;
    }

    setNotice(null);
    setSubmitting(true);

    const payload = new URLSearchParams({
      "form-name": formName,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date: selectedISO,
      eventType: eventType.trim(),
      location: location.trim(),
      message: message.trim(),
      "bot-field": botField,
    });

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      });

      if (!response.ok) {
        setNotice("We could not send that enquiry. Please try again or email us directly.");
        return;
      }

      setNotice("Thanks. Your booking enquiry has been sent.");
      setName("");
      setEmail("");
      setPhone("");
      setEventType("");
      setLocation("");
      setMessage("");
      setSelectedISO("");
    } catch {
      setNotice("We could not send that enquiry. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="contact-faq-section" aria-label="Contact and FAQs">
      <div className="contact-faq-section__inner">
        <header className="contact-faq-section__header">
          <p className="contact-faq-section__eyebrow">{contact.eyebrow}</p>
          <h2 className="contact-faq-section__title">{contact.heading}</h2>
          <p className="contact-faq-section__subtitle">{contact.subtitle}</p>
        </header>

        <div className="contact-faq-section__grid" data-testid="contact-faq-grid">
          <form
            className="contact-form-card"
            data-testid="contact-form-card"
            name={formName}
            method="POST"
            onSubmit={onSubmit}
            aria-label="Contact form"
          >
            <input type="hidden" name="form-name" value={formName} />
            <p hidden>
              <label>
                Do not fill this out:{" "}
                <input
                  name="bot-field"
                  value={botField}
                  onChange={(event) => setBotField(event.target.value)}
                />
              </label>
            </p>

            <div className="contact-form-card__grid">
              <label className="contact-form-card__field">
                <span>Date of Event</span>
                <input
                  name="date"
                  type="date"
                  min={todayISO}
                  value={selectedISO}
                  onChange={(event) => onDateInput(event.target.value)}
                  required
                />
              </label>

              <label className="contact-form-card__field">
                <span>Name</span>
                <input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="contact-form-card__field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@email.com"
                  required
                />
              </label>

              <label className="contact-form-card__field">
                <span>Phone</span>
                <input
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  placeholder="+44 7..."
                />
              </label>

              <label className="contact-form-card__field">
                <span>Event Type</span>
                <input
                  name="eventType"
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value)}
                  placeholder="Wedding / party / corporate"
                />
              </label>

              <label className="contact-form-card__field">
                <span>Location</span>
                <input
                  name="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Town / venue"
                />
              </label>

              <label className="contact-form-card__field contact-form-card__field--full">
                <span>Message</span>
                <textarea
                  name="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Tell us about timings, guest count, and any special requests."
                />
              </label>
            </div>

            {notice ? <p className="contact-form-card__notice">{notice}</p> : null}

            <div className="contact-form-card__actions">
              <button type="submit" className="bookings-btn bookings-btn--primary" disabled={submitting}>
                {submitting ? "Sending..." : "Send Enquiry"}
              </button>
              <a className="bookings-text-link" href="mailto:info@skaraceilidh.com">
                Or email info@skaraceilidh.com
              </a>
            </div>
          </form>

          <aside id="faqs" className="faq-card" data-testid="faq-card" aria-label="Frequently asked questions">
            <p className="faq-card__eyebrow">FAQs</p>
            <h3 className="faq-card__title">Frequently asked questions.</h3>

            <div className="faq-card__items">
              {faqs.map((faq) => (
                <details key={faq.id} className="faq-card__item">
                  <summary>{faq.question}</summary>
                  <div className="faq-card__answer">
                    {faq.answer.map((paragraph, index) => (
                      <p key={`${faq.id}-answer-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
