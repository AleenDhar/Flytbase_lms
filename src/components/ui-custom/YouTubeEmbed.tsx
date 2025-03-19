import { useState, useEffect, useRef } from "react";

// YouTube API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: HTMLElement | string,
        config: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            modestbranding?: number;
            rel?: number;
            origin?: string;
            [key: string]: any;
          };
          events?: {
            onReady?: (event: any) => void;
            onStateChange?: (event: any) => void;
            [key: string]: any;
          };
        }
      ) => {
        destroy: () => void;
        getCurrentTime: () => number;
        getDuration: () => number;
        [key: string]: any;
      };
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
        UNSTARTED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  onVideoEnd?: () => void;
  onVideoProgress?: (progress: number) => void;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = "YouTube video player",
  autoplay = false,
  onVideoEnd,
  onVideoProgress,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [progressInterval, setProgressIntervalId] = useState<number | null>(
    null
  );
  const playerRef = useRef<HTMLDivElement>(null);

  // Load YouTube API
  useEffect(() => {
    // Only load the API once
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";

      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (progressInterval) {
        window.clearInterval(progressInterval);
      }

      // Clean up player
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

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

  const handlePlayerReady = () => {
    setIsLoading(false);

    // If we need to track progress, set up an interval
    if (onVideoProgress && player) {
      const interval = window.setInterval(() => {
        if (player && typeof player.getCurrentTime === "function") {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          const progressPercent = (currentTime / duration) * 100;
          onVideoProgress(progressPercent);
        }
      }, 1000);

      setProgressIntervalId(interval);
    }
  };

  const handlePlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.ENDED && onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    // <div className={`relative w-full overflow-hidden rounded-xl ${className}`}>
    //   {isLoading && (
    //     <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
    //       <div className="loading-dots">
    //         <div></div>
    //         <div></div>
    //         <div></div>
    //       </div>
    //     </div>
    //   )}

    <div className="w-full h-full">
      <div ref={playerRef} className="w-full h-full" />
    </div>
    // </div>
  );
};

export default YouTubeEmbed;
