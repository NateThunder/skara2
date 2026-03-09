"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Mention, SiteContent } from "@/app/lib/site-content";

const emptySiteContent: SiteContent = {
  about: {
    eyebrow: "About",
    heading: "",
    text: "",
  },
  mentions: [],
  navLayoutMode: "hamburger",
  updatedAt: "",
};

function createMention(): Mention {
  return {
    id: `mention-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quote: "",
    source: "",
    url: "",
  };
}

export function SiteContentEditor() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(emptySiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const hasMentions = useMemo(() => content.mentions.length > 0, [content.mentions.length]);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/content", { cache: "no-store" });
      const json = (await response.json()) as { content?: SiteContent; error?: string };

      if (response.status === 401) {
        router.push("/login?redirectTo=/admin&error=session-expired");
        return;
      }

      if (!response.ok || !json.content) {
        throw new Error(json.error ?? "Failed to load editable content.");
      }

      setContent(json.content);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load editable content.";
      setNotice(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const saveChanges = async () => {
    setSaving(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      });

      const json = (await response.json()) as { content?: SiteContent; error?: string };

      if (response.status === 401) {
        router.push("/login?redirectTo=/admin&error=session-expired");
        return;
      }

      if (!response.ok || !json.content) {
        throw new Error(json.error ?? "Failed to save changes.");
      }

      setContent(json.content);
      setNotice("Saved. Homepage content has been updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save changes.";
      setNotice(message);
    } finally {
      setSaving(false);
    }
  };

  const handleMentionChange = (id: string, field: keyof Mention, value: string) => {
    setContent((current) => ({
      ...current,
      mentions: current.mentions.map((mention) =>
        mention.id === id ? { ...mention, [field]: value } : mention
      ),
    }));
  };

  const addMention = () => {
    setContent((current) => ({
      ...current,
      mentions: [createMention(), ...current.mentions],
    }));
  };

  const removeMention = (id: string) => {
    setContent((current) => ({
      ...current,
      mentions: current.mentions.filter((mention) => mention.id !== id),
    }));
  };

  return (
    <section className="dash-editor" id="content" aria-labelledby="content-editor-heading">
      <header className="dash-editor__header">
        <div>
          <h2 id="content-editor-heading">Site content editor</h2>
          <p>Edit the homepage About section and mentions without leaving this dashboard.</p>
        </div>
        <div className="dash-editor__actions">
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            onClick={() => void loadContent()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Reload content"}
          </button>
          <button
            type="button"
            className="dash-btn dash-btn--primary"
            onClick={saveChanges}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </header>

      {loading ? <p className="dash-editor__status">Loading editable content...</p> : null}

      {!loading ? (
        <div className="dash-editor__grid">
          <article className="dash-editor__card">
            <h3>About section</h3>
            <div className="dash-editor__fields">
              <label className="dash-editor__field">
                <span>Eyebrow</span>
                <input
                  value={content.about.eyebrow}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      about: { ...current.about, eyebrow: event.target.value },
                    }))
                  }
                />
              </label>

              <label className="dash-editor__field">
                <span>Heading</span>
                <textarea
                  value={content.about.heading}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      about: { ...current.about, heading: event.target.value },
                    }))
                  }
                />
              </label>

              <label className="dash-editor__field">
                <span>About text</span>
                <textarea
                  value={content.about.text}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      about: { ...current.about, text: event.target.value },
                    }))
                  }
                />
              </label>
            </div>
          </article>

          <article className="dash-editor__card">
            <div className="dash-editor__mentions-head">
              <h3>Mentions</h3>
              <button type="button" className="dash-btn dash-btn--ghost" onClick={addMention}>
                Add mention
              </button>
            </div>

            {!hasMentions ? (
              <p className="dash-editor__status">No mentions added yet.</p>
            ) : (
              <div className="dash-editor__mentions-grid">
                {content.mentions.map((mention) => (
                  <article className="dash-editor__mention" key={mention.id}>
                    <label className="dash-editor__field">
                      <span>Quote</span>
                      <textarea
                        value={mention.quote}
                        onChange={(event) =>
                          handleMentionChange(mention.id, "quote", event.target.value)
                        }
                      />
                    </label>

                    <label className="dash-editor__field">
                      <span>Source</span>
                      <input
                        value={mention.source}
                        onChange={(event) =>
                          handleMentionChange(mention.id, "source", event.target.value)
                        }
                      />
                    </label>

                    <label className="dash-editor__field">
                      <span>Mention link URL</span>
                      <input
                        placeholder="https://example.com/review-or-article"
                        value={mention.url}
                        onChange={(event) =>
                          handleMentionChange(mention.id, "url", event.target.value)
                        }
                      />
                    </label>

                    <button
                      type="button"
                      className="dash-btn dash-btn--danger"
                      onClick={() => removeMention(mention.id)}
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            )}
          </article>
        </div>
      ) : null}

      {notice ? <p className="dash-editor__status">{notice}</p> : null}
      {content.updatedAt ? (
        <p className="dash-editor__meta">
          Last updated: {new Date(content.updatedAt).toLocaleString("en-GB")}
        </p>
      ) : null}
    </section>
  );
}
