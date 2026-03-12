"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { buildBookingMailtoHref } from "@/app/lib/booking-mailto";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatISODateLocal(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseISODateLocal(iso: string) {
  const [y, m, d] = iso.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function startOfTodayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function BookingsSection() {
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

  function isPastISO(iso: string) {
    const date = parseISODateLocal(iso);
    if (!date) return false;
    return date.getTime() < today.getTime();
  }

  function onDateInput(next: string) {
    if (!next) {
      setNotice(null);
      setSelectedISO("");
      return;
    }

    if (isPastISO(next)) {
      setNotice("Please choose today or a future date.");
      return;
    }

    setNotice(null);
    setSelectedISO(next);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !selectedISO) {
      setNotice("Add your name, email, and pick a date to send an enquiry.");
      return;
    }
    if (botField) return;

    setNotice(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date: selectedISO,
          eventType: eventType.trim(),
          location: location.trim(),
          message: message.trim(),
          botField,
          source: "bookings-section",
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (response.status === 503 && body?.error?.includes("configured yet")) {
          setNotice("Our online form is temporarily offline. Opening your email app instead.");
          window.location.assign(
            buildBookingMailtoHref({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              date: selectedISO,
              eventType: eventType.trim(),
              location: location.trim(),
              message: message.trim(),
              source: "bookings-section",
            })
          );
          return;
        }
        setNotice(body?.error ?? "We could not send that enquiry. Please try again or email us directly.");
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
    <section id="bookings" className="bookings-section" aria-label="Bookings">
      <div className="bookings-section__inner">
        <p className="bookings-section__eyebrow">Bookings</p>
        <h2 className="bookings-section__title">Send an enquiry.</h2>
        <p className="bookings-section__subtitle">
          Share your preferred date and event details, and we will confirm availability quickly.
        </p>

        <div className="bookingGrid">
          <form
            className="bookingForm"
            method="POST"
            onSubmit={onSubmit}
            aria-label="Booking form"
          >
            <p hidden>
              <label>
                Don&apos;t fill this out:{" "}
                <input
                  name="bot-field"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                />
              </label>
            </p>
            <div className="formHeader">
              <p className="formTitle">Request a booking</p>
              <p className="muted formSub">
                Add your preferred date and event details, and we will get back to confirm.
              </p>
            </div>

            <div className="formGrid">
              <label className="field">
                <span className="fieldLabel">Date</span>
                <input
                  className="input"
                  name="date"
                  type="date"
                  min={todayISO}
                  value={selectedISO}
                  onChange={(e) => onDateInput(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span className="fieldLabel">Name</span>
                <input
                  className="input"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="field">
                <span className="fieldLabel">Email</span>
                <input
                  className="input"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@email.com"
                  required
                />
              </label>

              <label className="field">
                <span className="fieldLabel">Phone (optional)</span>
                <input
                  className="input"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+44 7..."
                />
              </label>

              <label className="field">
                <span className="fieldLabel">Event type</span>
                <input
                  className="input"
                  name="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="Wedding / party / corporate"
                />
              </label>

              <label className="field">
                <span className="fieldLabel">Location</span>
                <input
                  className="input"
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Town / venue"
                />
              </label>

              <label className="field fieldFull">
                <span className="fieldLabel">Message</span>
                <textarea
                  className="textarea"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Tell us about timings, guest count, dancefloor space, and any special requests."
                />
              </label>
            </div>

            {notice ? <p className="formNotice">{notice}</p> : null}

            <div className="formActions">
              <button
                type="submit"
                className="bookings-btn bookings-btn--primary"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send enquiry"}
              </button>
              <a className="bookings-text-link" href="mailto:info@skaraceilidh.com">
                Or email info@skaraceilidh.com
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
