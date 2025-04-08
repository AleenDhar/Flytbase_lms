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
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  initialPosition?: number;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  autoplay = true,
  onVideoEnd,
  onVideoProgress,
  onProgressUpdate,
  initialPosition = 0,
  className = "",
}) => {
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const initialSeekDone = useRef<boolean>(false);

  const initializePlayer = () => {
    if (!playerRef.current) return;

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
        start: initialPosition > 0 ? Math.floor(initialPosition) : 0,
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handlePlayerStateChange,
      },
    });

    setPlayer(newPlayer);
  };

  const handlePlayerReady = (event: any) => {
    if (initialPosition > 0 && !initialSeekDone.current) {
      event.target.seekTo(initialPosition);
      initialSeekDone.current = true;
    }

    if (autoplay) {
      event.target.playVideo();
    }

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (event.target && typeof event.target.getCurrentTime === "function") {
        const currentTime = event.target.getCurrentTime();
        const duration = event.target.getDuration();
        const playerState = event.target.getPlayerState();
        const isPlaying = playerState === window.YT.PlayerState.PLAYING;

        // Only update while playing
        if (duration > 0 && isPlaying) {
          // Update UI progress
          if (onVideoProgress) {
            const progressPercent = (currentTime / duration) * 100;
            onVideoProgress(progressPercent);
          }

          // Update database progress
          if (onProgressUpdate) {
            onProgressUpdate(currentTime, duration);
          }
        }
      }
    }, 1000);
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
    // Reset the seek flag when video ID changes
    initialSeekDone.current = false;

    if (player && typeof player.loadVideoById === "function") {
      if (initialPosition > 0) {
        player.loadVideoById({
          videoId: videoId,
          startSeconds: initialPosition,
        });
        initialSeekDone.current = true;
      } else {
        player.loadVideoById(videoId);
      }

      if (autoplay && typeof player.playVideo === "function") {
        setTimeout(() => player.playVideo(), 100);
      } else if (!autoplay && typeof player.pauseVideo === "function") {
        setTimeout(() => player.pauseVideo(), 100);
      }
    }
  }, [videoId, player, autoplay, initialPosition]);

  return (
    <div className={`w-full h-full ${className}`}>
      <div ref={playerRef} className="w-full h-full" />
    </div>
  );
};

export default YouTubeEmbed;
