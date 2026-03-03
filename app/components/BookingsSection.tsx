"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type AvailabilityData = {
  timezone?: string;
  booked: string[];
  notes?: Record<string, string>;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const AVAILABILITY: AvailabilityData = {
  timezone: "UK time",
  booked: ["2026-04-11", "2026-04-25", "2026-05-09", "2026-05-22"],
  notes: {
    "2026-04-11": "Private wedding booking",
    "2026-05-22": "Corporate event booking",
  },
};

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

function addMonthsLocal(base: Date, months: number) {
  return new Date(base.getFullYear(), base.getMonth() + months, 1);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function getMonthGrid(date: Date) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const firstOfMonth = new Date(year, monthIndex, 1);
  const firstWeekdayMonday0 = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstWeekdayMonday0; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, monthIndex, day));

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i += 1) cells.push(null);
  }

  return cells;
}

export default function BookingsSection() {
  const FORM_NAME = "booking-enquiry";
  const bookedSet = useMemo(() => new Set(AVAILABILITY.booked), []);
  const notes = AVAILABILITY.notes ?? {};
  const today = useMemo(() => startOfTodayLocal(), []);

  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedISO, setSelectedISO] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);

  const viewBase = useMemo(() => addMonthsLocal(today, monthOffset), [today, monthOffset]);
  const viewMonths = useMemo(() => [viewBase], [viewBase]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedDate = useMemo(
    () => (selectedISO ? parseISODateLocal(selectedISO) : null),
    [selectedISO]
  );

  function isPastISO(iso: string) {
    const date = parseISODateLocal(iso);
    if (!date) return false;
    return date.getTime() < today.getTime();
  }

  function chooseDate(iso: string) {
    if (bookedSet.has(iso)) {
      setNotice("That date is marked as booked. Please choose another.");
      return;
    }
    if (isPastISO(iso)) {
      setNotice("Please choose a future date.");
      return;
    }
    setNotice(null);
    setSelectedISO(iso);
  }

  function onDateInput(next: string) {
    if (!next) {
      setSelectedISO("");
      return;
    }
    chooseDate(next);
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

    const payload = new URLSearchParams({
      "form-name": FORM_NAME,
      name: name.trim(),
      email: email.trim(),
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
        <h2 className="bookings-section__title">Check availability. Send enquiry.</h2>
        <p className="bookings-section__subtitle">
          Pick a date, add your details, and we will confirm your event plan quickly.
        </p>

        <div className="bookingGrid">
          <div className="calendarShell" aria-label="Availability calendar">
            <div className="calendarTop">
              <div className="legend" aria-label="Legend">
                <span className="legendItem">
                  <span className="legendSwatch legendAvailable" aria-hidden="true" />
                  Available
                </span>
                <span className="legendItem">
                  <span className="legendSwatch legendBooked" aria-hidden="true" />
                  Booked
                </span>
              </div>

              <div className="calNav" aria-label="Month navigation">
                <button
                  type="button"
                  className="calNavBtn"
                  onClick={() => setMonthOffset((v) => Math.max(-1, v - 1))}
                  aria-label="Previous month"
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="calNavBtn"
                  onClick={() => setMonthOffset((v) => Math.min(12, v + 1))}
                  aria-label="Next month"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="months">
              {viewMonths.map((m) => (
                <div key={`${m.getFullYear()}-${m.getMonth()}`} className="month">
                  <div className="monthHeader">
                    <p className="monthTitle">{monthLabel(m)}</p>
                    <p className="monthHint">
                      {AVAILABILITY.timezone ? `Times: ${AVAILABILITY.timezone}` : ""}
                    </p>
                  </div>

                  <div className="weekdayRow" aria-hidden="true">
                    {WEEKDAYS.map((d) => (
                      <div key={d} className="weekdayCell">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="calGrid" role="grid">
                    {getMonthGrid(m).map((cell, idx) => {
                      if (!cell) return <div key={`e-${idx}`} className="calCell empty" />;

                      const iso = formatISODateLocal(cell);
                      const booked = bookedSet.has(iso);
                      const past = cell.getTime() < today.getTime();
                      const selected = iso === selectedISO;
                      const disabled = booked || past;
                      const note = notes[iso];

                      return (
                        <button
                          key={iso}
                          type="button"
                          className={[
                            "calCell",
                            booked ? "booked" : "available",
                            selected ? "selected" : "",
                          ].join(" ")}
                          onClick={() => chooseDate(iso)}
                          disabled={disabled}
                          aria-pressed={selected}
                          aria-label={
                            note
                              ? `${iso} (${booked ? "Booked" : "Available"}: ${note})`
                              : `${iso} (${booked ? "Booked" : "Available"})`
                          }
                          title={note ? note : undefined}
                        >
                          <span className="dayNum">{cell.getDate()}</span>
                          {booked ? <span className="dot" aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            className="bookingForm"
            name={FORM_NAME}
            method="POST"
            onSubmit={onSubmit}
            aria-label="Booking form"
          >
            <input type="hidden" name="form-name" value={FORM_NAME} />
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
                Pick a date, add your details, and we will get back to confirm.
              </p>
            </div>

            <div className="formGrid">
              <label className="field">
                <span className="fieldLabel">Date</span>
                <input
                  className="input"
                  name="date"
                  type="date"
                  value={selectedISO}
                  onChange={(e) => onDateInput(e.target.value)}
                />
                {selectedDate ? (
                  <span className="fieldHint">
                    Selected:{" "}
                    {selectedDate.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                ) : (
                  <span className="fieldHint">Choose a date from the calendar.</span>
                )}
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
