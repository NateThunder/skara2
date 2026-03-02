import WatchVideoCard from "./WatchVideoCard";

type YouTubeVideo = {
  id: string;
  title: string;
};

type YouTubeChannelsResponse = {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type YouTubePlaylistItem = {
  snippet?: {
    title?: string;
    resourceId?: {
      videoId?: string;
    };
    thumbnails?: {
      maxres?: { url?: string };
      standard?: { url?: string };
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

type YouTubePlaylistResponse = {
  items?: YouTubePlaylistItem[];
};

async function getUploadsPlaylistId(apiKey: string, channelHandle: string) {
  const normalizedHandle = channelHandle.startsWith("@")
    ? channelHandle
    : `@${channelHandle}`;

  const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelUrl.searchParams.set("part", "contentDetails");
  channelUrl.searchParams.set("forHandle", normalizedHandle);
  channelUrl.searchParams.set("key", apiKey);

  const response = await fetch(channelUrl.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`YouTube channels API failed with status ${response.status}`);
  }

  const data = (await response.json()) as YouTubeChannelsResponse;
  const uploadsPlaylistId =
    data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;

  if (!uploadsPlaylistId) {
    throw new Error("Could not resolve uploads playlist ID for YouTube channel handle.");
  }

  return uploadsPlaylistId;
}

async function getLatestVideos(
  apiKey: string,
  uploadsPlaylistId: string,
  count = 3
): Promise<YouTubeVideo[]> {
  const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistUrl.searchParams.set("part", "snippet");
  playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
  playlistUrl.searchParams.set("maxResults", String(count));
  playlistUrl.searchParams.set("key", apiKey);

  const response = await fetch(playlistUrl.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`YouTube playlist API failed with status ${response.status}`);
  }

  const data = (await response.json()) as YouTubePlaylistResponse;
  const items = Array.isArray(data?.items) ? data.items : [];

  return items
    .map((item) => {
      const snippet = item?.snippet;
      const videoId = snippet?.resourceId?.videoId;
      const title = snippet?.title;
      if (!videoId || !title) {
        return null;
      }

      return {
        id: videoId,
        title,
      };
    })
    .filter((video): video is YouTubeVideo => video !== null);
}

export default async function WatchSection() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelHandle = process.env.YOUTUBE_CHANNEL_HANDLE;

  let videos: YouTubeVideo[] = [];

  if (apiKey && channelHandle) {
    try {
      const uploadsPlaylistId = await getUploadsPlaylistId(apiKey, channelHandle);
      videos = await getLatestVideos(apiKey, uploadsPlaylistId, 3);
    } catch {
      videos = [];
    }
  }

  return (
    <section id="watch" className="watch-section" aria-label="Watch latest YouTube videos">
      <div className="watch-section__inner">
        <p className="watch-section__eyebrow">Watch</p>
        <h2 className="watch-section__title">Latest from YouTube.</h2>
        <p className="watch-section__subtitle">
          Recent Skara Ceilidh Band performances direct from the official channel.
        </p>

        {videos.length > 0 ? (
          <div className="watch-grid">
            {videos.map((video) => (
              <WatchVideoCard key={video.id} videoId={video.id} title={video.title} />
            ))}
          </div>
        ) : (
          <p className="watch-section__empty">
            Videos are temporarily unavailable. Check the YouTube channel directly for the latest
            uploads.
          </p>
        )}
      </div>
    </section>
  );
}
