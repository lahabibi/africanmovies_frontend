import { useEffect, useRef } from "react";

function HlsVideoPlayer({
  onFatalError,
  onProgress,
  poster,
  source,
  startTime = 0,
  title,
}) {
  const videoRef = useRef(null);
  const startTimeRef = useRef(startTime);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return undefined;

    let hls;
    let disposed = false;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      import("hls.js")
        .then(({ default: Hls }) => {
          if (disposed) return;

          if (!Hls.isSupported()) {
            onFatalError?.();
            return;
          }

          hls = new Hls({
            enableWorker: true,
            maxBufferLength: 30,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (!data.fatal) return;

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }

            onFatalError?.();
          });
        })
        .catch(() => onFatalError?.());
    }

    return () => {
      disposed = true;
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [onFatalError, source]);

  const restorePosition = () => {
    const video = videoRef.current;
    const resumeAt = Number(startTimeRef.current) || 0;

    if (video && resumeAt > 0 && resumeAt < video.duration) {
      video.currentTime = resumeAt;
    }
  };

  return (
    <video
      aria-label={title ? `Playing ${title}` : "Movie player"}
      autoPlay
      className="playback-player__video"
      controls
      controlsList="nodownload"
      onEnded={(event) => onProgress?.(event.currentTarget.currentTime, true)}
      onLoadedMetadata={restorePosition}
      onPause={(event) => onProgress?.(event.currentTarget.currentTime, true)}
      onTimeUpdate={(event) => onProgress?.(event.currentTarget.currentTime)}
      playsInline
      poster={poster || undefined}
      preload="auto"
      ref={videoRef}
    />
  );
}

export default HlsVideoPlayer;
