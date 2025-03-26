import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeEmbedProps {
  videoId: string;
  autoplay?: boolean;
  onVideoEnd?: () => void;
  onVideoProgress?: (progress: number) => void;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  autoplay = false,
  onVideoEnd,
  onVideoProgress,
  className = "",
}) => {
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const initializePlayer = () => {
    if (!playerRef.current) return;

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handlePlayerStateChange,
      },
    });

    setPlayer(newPlayer);
  };

  const handlePlayerReady = (event: any) => {
    if (autoplay) {
      event.target.playVideo();
    }

    if (onVideoProgress) {
      progressInterval.current = setInterval(() => {
        if (player && typeof player.getCurrentTime === "function") {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          const progressPercent = (currentTime / duration) * 100;
          onVideoProgress(progressPercent);
        }
      }, 1000);
    }
  };

  const handlePlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.ENDED && onVideoEnd) {
      onVideoEnd();
    }
  };

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (player && typeof player.cueVideoById === "function") {
      player.cueVideoById(videoId);
      if (autoplay && typeof player.playVideo === "function") {
        setTimeout(() => player.playVideo(), 500);
      }
    }
  }, [videoId, player, autoplay]);

  return (
    <div className={`w-full h-full ${className}`}>
      <div ref={playerRef} className="w-full h-full" />
    </div>
  );
};

export default YouTubeEmbed;
