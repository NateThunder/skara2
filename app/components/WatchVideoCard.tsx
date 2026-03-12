"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";

type WatchVideoCardProps = {
  videoId: string;
  title: string;
  isActive: boolean;
  onActivate: (videoId: string) => void;
};

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YouTubePlayer }) => void;
      };
    }
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youTubeApiPromise: Promise<YouTubeNamespace> | null = null;
const MOBILE_QUERY = "(max-width: 760px)";
const YT_STATE_PLAYING = 1;
const YT_STATE_BUFFERING = 3;

function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API can only load in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youTubeApiPromise) {
    return youTubeApiPromise;
  }

  youTubeApiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    ) as HTMLScriptElement | null;

    const resolveIfReady = () => {
      if (window.YT?.Player) {
        resolve(window.YT);
        return true;
      }

      return false;
    };

    if (resolveIfReady()) {
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (!resolveIfReady()) {
        reject(new Error("YouTube IFrame API loaded without window.YT.Player."));
      }
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        reject(new Error("Failed to load YouTube IFrame API script."));
      };
      document.head.appendChild(script);
    }
  }).catch((error) => {
    youTubeApiPromise = null;
    throw error;
  });

  return youTubeApiPromise;
}

export default function WatchVideoCard({
  videoId,
  title,
  isActive,
  onActivate,
}: WatchVideoCardProps) {
  const isMobile = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const mediaQuery = window.matchMedia(MOBILE_QUERY);
      const listener = () => onStoreChange();
      mediaQuery.addEventListener("change", listener);
      return () => {
        mediaQuery.removeEventListener("change", listener);
      };
    },
    () => {
      if (typeof window === "undefined") {
        return false;
      }

      return window.matchMedia(MOBILE_QUERY).matches;
    },
    () => false
  );
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const [isPopoutOpen, setIsPopoutOpen] = useState(false);
  const [resumeAtSeconds, setResumeAtSeconds] = useState(0);
  const [inlineAutoplay, setInlineAutoplay] = useState(true);
  const [inlineMuted, setInlineMuted] = useState(false);
  const [isInlinePlayerReady, setIsInlinePlayerReady] = useState(false);
  const [isModalPlayerReady, setIsModalPlayerReady] = useState(false);
  const inlinePlayerMountRef = useRef<HTMLDivElement | null>(null);
  const inlinePlayerRef = useRef<YouTubePlayer | null>(null);
  const modalPlayerMountRef = useRef<HTMLDivElement | null>(null);
  const modalPlayerRef = useRef<YouTubePlayer | null>(null);

  const capturePlayerState = useCallback((player: YouTubePlayer | null) => {
    const currentTime = player?.getCurrentTime();
    const playerState = player?.getPlayerState();
    const playerIsMuted = player?.isMuted();

    if (typeof currentTime === "number" && Number.isFinite(currentTime)) {
      setResumeAtSeconds(currentTime);
    }

    if (typeof playerState === "number") {
      const shouldAutoplayInline =
        playerState === YT_STATE_PLAYING || playerState === YT_STATE_BUFFERING;
      setInlineAutoplay(shouldAutoplayInline);
    }

    if (typeof playerIsMuted === "boolean") {
      setInlineMuted(playerIsMuted);
    }
  }, []);

  const closePopoutToInline = useCallback(() => {
    onActivate(videoId);
    capturePlayerState(modalPlayerRef.current);

    setIsInlinePlayerReady(false);
    setIsModalPlayerReady(false);
    setIsPopoutOpen(false);
    setIsPlayingInline(true);
  }, [capturePlayerState, onActivate, videoId]);

  const playInlineInCard = useCallback(() => {
    onActivate(videoId);
    setResumeAtSeconds(0);
    setInlineAutoplay(true);
    setInlineMuted(false);
    setIsInlinePlayerReady(false);
    setIsModalPlayerReady(false);
    setIsPopoutOpen(false);
    setIsPlayingInline(true);
  }, [onActivate, videoId]);

  const openPopout = useCallback(() => {
    onActivate(videoId);
    capturePlayerState(inlinePlayerRef.current);
    setIsPlayingInline(true);
    setIsModalPlayerReady(false);
    setIsPopoutOpen(true);
  }, [capturePlayerState, onActivate, videoId]);

  const showInlinePlayer = isActive && isPlayingInline && !isPopoutOpen;

  useEffect(() => {
    if (!showInlinePlayer) {
      return;
    }

    let cancelled = false;

    const setupInlinePlayer = async () => {
      try {
        setIsInlinePlayerReady(false);
        const youTube = await loadYouTubeIframeApi();
        if (cancelled || !inlinePlayerMountRef.current) {
          return;
        }

        const inlinePlayer = new youTube.Player(inlinePlayerMountRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            mute: inlineMuted ? 1 : 0,
            rel: 0,
            playsinline: 1,
            start: Math.max(0, Math.floor(resumeAtSeconds)),
          },
          events: {
            onReady: ({ target }) => {
              if (cancelled) {
                return;
              }

              if (inlinePlayerRef.current && inlinePlayerRef.current !== target) {
                return;
              }

              setIsInlinePlayerReady(true);
              const time = Math.max(0, Math.floor(resumeAtSeconds));
              target.seekTo(time, true);

              if (inlineAutoplay) {
                if (inlineMuted) {
                  target.mute();
                } else {
                  target.unMute();
                }
                target.playVideo();
                return;
              }

              target.pauseVideo();
              if (inlineMuted) {
                target.mute();
              } else {
                target.unMute();
              }
            },
          },
        });
        inlinePlayerRef.current = inlinePlayer;
      } catch {
        setIsInlinePlayerReady(false);
        setIsPlayingInline(false);
      }
    };

    setupInlinePlayer();

    return () => {
      cancelled = true;
      inlinePlayerRef.current?.destroy();
      inlinePlayerRef.current = null;
    };
  }, [inlineAutoplay, inlineMuted, resumeAtSeconds, showInlinePlayer, videoId]);

  useEffect(() => {
    if (!isPopoutOpen || !isActive) {
      return;
    }

    let cancelled = false;

    const setupPlayer = async () => {
      try {
        setIsModalPlayerReady(false);
        const youTube = await loadYouTubeIframeApi();
        if (cancelled || !modalPlayerMountRef.current) {
          return;
        }

        modalPlayerRef.current = new youTube.Player(modalPlayerMountRef.current, {
          videoId,
          playerVars: {
            autoplay: inlineAutoplay ? 1 : 0,
            mute: inlineMuted ? 1 : 0,
            rel: 0,
            playsinline: 1,
            start: Math.max(0, Math.floor(resumeAtSeconds)),
          },
          events: {
            onReady: ({ target }) => {
              if (cancelled) {
                return;
              }

              if (modalPlayerRef.current && modalPlayerRef.current !== target) {
                return;
              }

              setIsModalPlayerReady(true);
              const time = Math.max(0, Math.floor(resumeAtSeconds));
              target.seekTo(time, true);

              if (inlineMuted) {
                target.mute();
              } else {
                target.unMute();
              }

              if (inlineAutoplay) {
                target.playVideo();
              } else {
                target.pauseVideo();
              }
            },
          },
        });
      } catch {
        setIsModalPlayerReady(false);
        setIsPopoutOpen(false);
        setIsPlayingInline(true);
      }
    };

    setupPlayer();

    return () => {
      cancelled = true;
      modalPlayerRef.current?.destroy();
      modalPlayerRef.current = null;
    };
  }, [inlineAutoplay, inlineMuted, isActive, isPopoutOpen, resumeAtSeconds, videoId]);

  useEffect(() => {
    if (!isPopoutOpen || !isActive) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopoutToInline();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePopoutToInline, isActive, isPopoutOpen]);

  useEffect(() => {
    return () => {
      inlinePlayerRef.current?.destroy();
      inlinePlayerRef.current = null;
      modalPlayerRef.current?.destroy();
      modalPlayerRef.current = null;
    };
  }, []);

  return (
    <article className="watch-card" aria-label={title}>
      {showInlinePlayer ? (
        <div className="watch-card__media watch-card__media--playing">
          {!isMobile ? (
            <button
              type="button"
              className="watch-card__popout"
              onClick={openPopout}
              aria-label={`Open popout for ${title}`}
            >
              Pop out
            </button>
          ) : null}
          {!isInlinePlayerReady ? (
            <div className="watch-card__loading" aria-hidden="true">
              <span className="watch-card__loading-label">Loading video...</span>
            </div>
          ) : null}
          <div
            ref={inlinePlayerMountRef}
            className={`watch-card__iframe${
              isInlinePlayerReady ? " watch-card__iframe--ready" : ""
            }`}
            aria-label={title}
          />
        </div>
      ) : (
        <button
          type="button"
          className="watch-card__media"
          onClick={isMobile ? playInlineInCard : openPopout}
          aria-label={`Play ${title}`}
          aria-haspopup={isMobile ? undefined : "dialog"}
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

      {isActive && isPopoutOpen && !isMobile ? (
        <div
          className="watch-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={closePopoutToInline}
        >
          <div className="watch-modal__panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="watch-modal__close"
              onClick={closePopoutToInline}
              aria-label={`Close popout video: ${title}`}
            >
              <span aria-hidden="true">X</span>
            </button>
            <div className="watch-modal__video-wrap">
              {!isModalPlayerReady ? (
                <div className="watch-modal__loading" aria-hidden="true">
                  <span className="watch-card__loading-label">Loading video...</span>
                </div>
              ) : null}
              <div
                ref={modalPlayerMountRef}
                className={`watch-modal__player${
                  isModalPlayerReady ? " watch-modal__player--ready" : ""
                }`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
