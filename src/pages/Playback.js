import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import {
  completePlayback,
  createPlaybackSession,
  updatePlaybackProgress,
} from "../api/watchApi";
import HlsVideoPlayer from "../components/watch/HlsVideoPlayer";

const PROGRESS_INTERVAL_MS = 15 * 1000;
const TOKEN_REFRESH_BUFFER_SECONDS = 45;

function Playback() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const initialSession = location.state?.playbackSession || null;
  const [session, setSession] = useState(initialSession);
  const [isLoading, setIsLoading] = useState(!initialSession);
  const [error, setError] = useState("");
  const [completion, setCompletion] = useState({
    phase: "idle",
    message: "",
  });
  const currentTimeRef = useRef(initialSession?.access?.currentTime || 0);
  const lastProgressSentAtRef = useRef(0);

  const loadSession = useCallback(async () => {
    if (!getAuthToken()) {
      navigate("/signin", {
        replace: true,
        state: { from: `/playback/${movieId}` },
      });
      return null;
    }

    setError("");

    try {
      const nextSession = await createPlaybackSession(movieId);
      setSession(nextSession);
      return nextSession;
    } catch (requestError) {
      if (requestError?.status === 401 || requestError?.status === 403) {
        navigate(`/movies/${movieId}?watch=now`, { replace: true });
        return null;
      }

      setError(requestError?.message || "We could not start playback.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [movieId, navigate]);

  useEffect(() => {
    if (!session) {
      loadSession();
    }
  }, [loadSession, session]);

  useEffect(() => {
    if (completion.phase !== "idle") return undefined;

    const expiresIn = Number(session?.playback?.expiresIn);
    if (!expiresIn) return undefined;

    const refreshAfter = Math.max(
      30,
      expiresIn - TOKEN_REFRESH_BUFFER_SECONDS,
    );
    const timer = window.setTimeout(() => {
      loadSession();
    }, refreshAfter * 1000);

    return () => window.clearTimeout(timer);
  }, [
    completion.phase,
    loadSession,
    session?.playback?.expiresIn,
    session?.playback?.token,
  ]);

  const saveProgress = useCallback(
    (currentTime, force = false) => {
      const normalizedTime = Math.max(0, Number(currentTime) || 0);
      currentTimeRef.current = normalizedTime;
      const now = Date.now();

      if (
        !force &&
        now - lastProgressSentAtRef.current < PROGRESS_INTERVAL_MS
      ) {
        return;
      }

      const orderId = session?.access?.orderId;
      if (!orderId) return;

      lastProgressSentAtRef.current = now;
      updatePlaybackProgress({
        orderId,
        currentTime: Math.floor(normalizedTime),
      }).catch(() => undefined);
    },
    [session?.access?.orderId],
  );

  const flushProgress = useCallback(
    (keepalive = false) => {
      const orderId = session?.access?.orderId;
      if (!orderId) return;

      updatePlaybackProgress({
        orderId,
        currentTime: Math.floor(Math.max(0, currentTimeRef.current)),
        keepalive,
      }).catch(() => undefined);
    },
    [session?.access?.orderId],
  );

  useEffect(() => {
    const handlePageHide = () => flushProgress(true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushProgress(true);
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      flushProgress(true);
    };
  }, [flushProgress]);

  const handleBack = () => {
    saveProgress(currentTimeRef.current, true);
    const returnPath = location.state?.from;

    if (returnPath?.startsWith("/")) {
      navigate(returnPath);
      return;
    }

    navigate(`/movies/${movieId}`);
  };

  const handlePlayerError = useCallback(() => {
    setError("The secure stream could not be loaded. Please try again.");
  }, []);

  const handlePlaybackEnded = useCallback(
    async (currentTime) => {
      const orderId = session?.access?.orderId;
      const finalTime = Math.max(0, Number(currentTime) || 0);
      currentTimeRef.current = finalTime;

      if (!orderId) {
        setCompletion({
          phase: "error",
          message: "Your completion could not be saved.",
        });
        return;
      }

      setCompletion({
        phase: "saving",
        message: "Saving your progress.",
      });

      try {
        await completePlayback({
          orderId,
          currentTime: Math.floor(finalTime),
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["orders"] }),
          queryClient.invalidateQueries({ queryKey: ["catalog", "home"] }),
          queryClient.invalidateQueries({
            queryKey: ["watch-access", movieId],
          }),
        ]);
        setCompletion({
          phase: "complete",
          message: "This title is still available in your library.",
        });
      } catch (completionError) {
        setCompletion({
          phase: "error",
          message:
            completionError?.message ||
            "Your completion could not be saved.",
        });
      }
    },
    [movieId, queryClient, session?.access?.orderId],
  );

  const watchAgain = useCallback(async () => {
    setCompletion({
      phase: "restarting",
      message: "Preparing the movie from the beginning.",
    });
    currentTimeRef.current = 0;
    lastProgressSentAtRef.current = 0;

    const nextSession = await loadSession();
    if (nextSession) {
      currentTimeRef.current = Number(nextSession.access?.currentTime) || 0;
      setCompletion({ phase: "idle", message: "" });
    }
  }, [loadSession]);

  if (isLoading) {
    return (
      <PlaybackState
        icon={<LoaderCircle className="playback-page__spinner" />}
        message="Preparing your secure stream."
        title="Starting playback"
      />
    );
  }

  if (error || !session?.playback?.url) {
    return (
      <PlaybackState
        actions={
          <>
            <button onClick={handleBack} type="button">
              <ArrowLeft aria-hidden="true" size={18} />
              Back
            </button>
            <button className="is-primary" onClick={loadSession} type="button">
              <RotateCcw aria-hidden="true" size={18} />
              Try again
            </button>
          </>
        }
        icon={<AlertCircle />}
        message={error || "Playback is unavailable for this movie."}
        title="Playback unavailable"
        variant="error"
      />
    );
  }

  const resumeAt = Math.max(
    currentTimeRef.current,
    Number(session.access?.currentTime) || 0,
  );

  return (
    <main className="playback-page">
      <div className="playback-page__topbar">
        <button aria-label="Leave player" onClick={handleBack} type="button">
          <ArrowLeft aria-hidden="true" size={24} />
        </button>
        <div>
          <span>Now Playing</span>
          <h1>{session.movie?.title || location.state?.movie?.title || "Movie"}</h1>
        </div>
      </div>

      <div className="playback-player">
        <HlsVideoPlayer
          onEnded={handlePlaybackEnded}
          onFatalError={handlePlayerError}
          onProgress={saveProgress}
          poster={session.movie?.poster}
          source={session.playback.url}
          startTime={resumeAt}
          title={session.movie?.title}
        />

        {completion.phase !== "idle" ? (
          <div className="playback-completion" role="status">
            <div className="playback-completion__content">
              <span aria-hidden="true">
                {["saving", "restarting"].includes(completion.phase) ? (
                  <LoaderCircle className="playback-page__spinner" />
                ) : completion.phase === "complete" ? (
                  <CheckCircle2 />
                ) : (
                  <AlertCircle />
                )}
              </span>
              <h2>
                {completion.phase === "complete"
                  ? `You finished ${session.movie?.title || "this movie"}`
                  : completion.phase === "error"
                    ? "Completion not saved"
                    : completion.phase === "restarting"
                      ? "Starting again"
                      : "Finishing up"}
              </h2>
              <p>{completion.message}</p>

              {completion.phase === "complete" ? (
                <div className="playback-page__state-actions">
                  <button onClick={handleBack} type="button">
                    <ArrowLeft aria-hidden="true" size={18} />
                    Back to movie
                  </button>
                  <button className="is-primary" onClick={watchAgain} type="button">
                    <RotateCcw aria-hidden="true" size={18} />
                    Watch Again
                  </button>
                </div>
              ) : null}

              {completion.phase === "error" ? (
                <div className="playback-page__state-actions">
                  <button onClick={handleBack} type="button">
                    <ArrowLeft aria-hidden="true" size={18} />
                    Back to movie
                  </button>
                  <button
                    className="is-primary"
                    onClick={() => handlePlaybackEnded(currentTimeRef.current)}
                    type="button"
                  >
                    <RotateCcw aria-hidden="true" size={18} />
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function PlaybackState({ actions, icon, message, title, variant = "default" }) {
  return (
    <main className={`playback-page playback-page--state playback-page--${variant}`}>
      <div className="playback-page__state-card">
        <span aria-hidden="true">{icon}</span>
        <h1>{title}</h1>
        <p>{message}</p>
        {actions ? <div className="playback-page__state-actions">{actions}</div> : null}
      </div>
    </main>
  );
}

export default Playback;
