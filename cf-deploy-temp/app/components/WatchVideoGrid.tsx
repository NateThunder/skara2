"use client";

import { useState } from "react";
import WatchVideoCard from "./WatchVideoCard";

type WatchVideo = {
  id: string;
  title: string;
};

type WatchVideoGridProps = {
  videos: WatchVideo[];
};

export default function WatchVideoGrid({ videos }: WatchVideoGridProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <div className="watch-grid">
      {videos.map((video) => (
        <WatchVideoCard
          key={video.id}
          videoId={video.id}
          title={video.title}
          isActive={activeVideoId === video.id}
          onActivate={setActiveVideoId}
        />
      ))}
    </div>
  );
}
