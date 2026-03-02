"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type WatchVideoCardProps = {
  videoId: string;
  title: string;
};

export default function WatchVideoCard({ videoId, title }: WatchVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedSrc = useMemo(
    () => `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
    [videoId]
  );

  return (
    <article className="watch-card" aria-label={title}>
      {isPlaying ? (
        <div className="watch-card__media watch-card__media--playing">
          <iframe
            className="watch-card__iframe"
            src={embedSrc}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          className="watch-card__media"
          onClick={() => setIsPlaying(true)}
          aria-label={`Play ${title}`}
        >
          <Image
            className="watch-card__thumbnail"
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            fill
            sizes="(min-width: 900px) 33vw, 100vw"
          />
          <span className="watch-card__play" aria-hidden="true">
            <span className="watch-card__play-icon" />
          </span>
        </button>
      )}
      <p className="watch-card__title">{title}</p>
    </article>
  );
}
