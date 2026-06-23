import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import {
  claimFreeMovie,
  createPlaybackSession,
  getWatchAccess,
} from "../api/watchApi";
import {
  chargeSavedCard,
  closePaymentAttempt,
  getPaymentStatus,
  getSavedPaymentMethod,
  initializeInlinePayment,
  savePaymentMethod,
  waitForPaymentCompletion,
  waitForPaymentVerification,
} from "../api/paymentApi";
import WatchFlowDialog from "../components/watch/WatchFlowDialog";
import { getWatchAccessQueryKey } from "../hooks/useWatchAccess";
import {
  FlutterwaveInlineCancelledError,
  openFlutterwaveInline,
} from "../utils/flutterwaveInline";
import {
  clearPaymentResult,
  clearPendingPayment,
  closePaymentWindow,
  createPaymentIdempotencyKey,
  getPendingPayment,
  openPaymentWindow,
  redirectToExternalCheckout,
  savePendingPayment,
  subscribeToPaymentResults,
} from "../utils/pendingPayment";

const WatchFlowContext = createContext(null);
const IDLE_FLOW = { phase: "idle", movie: null, decision: null, error: "" };

function WatchFlowProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [flow, setFlow] = useState(IDLE_FLOW);
  const [notice, setNotice] = useState("");
  const requestIdRef = useRef(0);
  const handledPaymentRef = useRef(null);
  const paymentWindowRef = useRef(null);
  const noticeTimerRef = useRef(null);

  const showNotice = useCallback((message) => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    setNotice(message);
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice("");
      noticeTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(
    () => () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    },
    [],
  );

  const closeActivePaymentWindow = useCallback(() => {
    closePaymentWindow(paymentWindowRef.current);
    paymentWindowRef.current = null;
  }, []);

  const preparePaymentWindow = useCallback(() => {
    clearPaymentResult();
    handledPaymentRef.current = null;
    const paymentWindow = openPaymentWindow();

    if (paymentWindow) {
      paymentWindowRef.current = paymentWindow;
    }

    return paymentWindow;
  }, []);

  const redirectToSignIn = useCallback(
    (movie, intent) => {
      const movieId = getMovieId(movie);
      const detailsId = movie?.slug || movieId;
      const watchIntent = intent === "resume" ? "resume" : "now";
      const returnPath = detailsId
        ? `/movies/${detailsId}?watch=${watchIntent}`
        : `${location.pathname}${location.search}`;

      navigate("/signin", { state: { from: returnPath } });
    },
    [location.pathname, location.search, navigate],
  );

  const openPlayback = useCallback(
    async (movie, movieId, requestId) => {
      setFlow((current) => ({ ...current, phase: "starting" }));
      const session = await createPlaybackSession(movieId);

      if (requestIdRef.current !== requestId) return;

      setFlow(IDLE_FLOW);
      navigate(`/playback/${movieId}`, {
        state: {
          from: getPlaybackReturnPath(location.pathname, location.search),
          movie: {
            id: movieId,
            slug: movie?.slug || movieId,
            title: movie?.title || session.movie?.title,
          },
          playbackSession: session,
        },
      });
    },
    [location.pathname, location.search, navigate],
  );

  const startWatch = useCallback(
    async (movie, { intent = "watch" } = {}) => {
      const movieId = getMovieId(movie);

      if (!getAuthToken()) {
        redirectToSignIn(movie, intent);
        return;
      }

      if (!isMongoObjectId(movieId)) {
        setFlow({
          phase: "error",
          movie,
          decision: null,
          error: "This movie is not available for playback yet.",
        });
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setFlow({ phase: "checking", movie, decision: null, error: "" });

      try {
        const decision = await queryClient.fetchQuery({
          queryFn: () => getWatchAccess(movieId),
          queryKey: getWatchAccessQueryKey(movieId),
          staleTime: 30 * 1000,
        });
        if (requestIdRef.current !== requestId) return;

        if (decision.action === "PLAY") {
          await openPlayback(movie, movieId, requestId);
          return;
        }

        if (decision.action === "CLAIM_FREE") {
          setFlow({ phase: "claim", movie, decision, error: "" });
          return;
        }

        if (decision.action === "PURCHASE") {
          setFlow({ phase: "purchase", movie, decision, error: "" });
          return;
        }

        setFlow({
          phase: "error",
          movie,
          decision,
          error: "This title is not available to watch right now.",
        });
      } catch (error) {
        if (requestIdRef.current !== requestId) return;

        if (error?.status === 401 || error?.status === 403) {
          setFlow(IDLE_FLOW);
          redirectToSignIn(movie, intent);
          return;
        }

        setFlow({
          phase: "error",
          movie,
          decision: null,
          error: error?.message || "We could not check your movie access.",
        });
      }
    },
    [openPlayback, queryClient, redirectToSignIn],
  );

  const completePaymentAndPlay = useCallback(
    async ({ movie, movieId, requestId, transactionId, txRef }) => {
      const completedPayment = await waitForPaymentVerification({
        transactionId,
        txRef,
      });
      showNotice("Payment successful");

      const resolvedMovieId = completedPayment?.movieId || movieId;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog", "home"] }),
        queryClient.invalidateQueries({
          queryKey: getWatchAccessQueryKey(resolvedMovieId),
        }),
      ]);
      await openPlayback(movie, resolvedMovieId, requestId);
    },
    [openPlayback, queryClient, showNotice],
  );

  const startVerifiedPaymentPlayback = useCallback(
    async ({ movie, movieId }) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      clearPendingPayment();
      clearPaymentResult();

      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["orders"] }),
          queryClient.invalidateQueries({ queryKey: ["payments"] }),
          queryClient.invalidateQueries({ queryKey: ["catalog", "home"] }),
          queryClient.invalidateQueries({
            queryKey: getWatchAccessQueryKey(movieId),
          }),
        ]);
        await openPlayback(movie, movieId, requestId);
      } catch (error) {
        if (requestIdRef.current !== requestId) return;

        setFlow({
          phase: "error",
          movie,
          decision: null,
          error:
            error?.message ||
            "Payment succeeded, but playback could not be started.",
        });
      }
    },
    [openPlayback, queryClient],
  );

  const handlePaymentWindowResult = useCallback(
    async (result) => {
      const pendingPayment = getPendingPayment();
      const txRef = result?.txRef;

      if (!txRef || pendingPayment?.txRef !== txRef) return;
      if (handledPaymentRef.current === txRef) return;
      handledPaymentRef.current = txRef;

      closeActivePaymentWindow();
      clearPaymentResult();
      window.focus();

      if (result.status !== "successful") {
        clearPendingPayment();
        setFlow({
          phase: "error",
          movie: {
            id: pendingPayment.movieId,
            slug: pendingPayment.movieId,
            title: pendingPayment.movieTitle,
          },
          decision: null,
          error:
            result.status === "cancelled"
              ? "Payment was cancelled. No charge was completed."
              : result.message || "Payment could not be completed.",
        });
        return;
      }

      const movieId = result.movieId || pendingPayment.movieId;
      const movie = {
        id: movieId,
        slug: movieId,
        title: pendingPayment.movieTitle,
      };
      const completion = {
        movie,
        movieId,
        transactionId: result.transactionId,
        txRef,
      };
      showNotice("Payment successful");

      if (pendingPayment.method === "hosted_card" && result.transactionId) {
        setFlow({
          phase: pendingPayment.hadSavedCard ? "replace-card" : "save-card",
          movie,
          decision: null,
          error: "",
          paymentCompletion: completion,
        });
        return;
      }

      await startVerifiedPaymentPlayback(completion);
    },
    [closeActivePaymentWindow, showNotice, startVerifiedPaymentPlayback],
  );

  useEffect(
    () => subscribeToPaymentResults(handlePaymentWindowResult),
    [handlePaymentWindowResult],
  );

  const watchExternalPayment = useCallback(
    async (txRef, transactionId) => {
      try {
        let resolvedTransactionId = transactionId;

        if (!resolvedTransactionId) {
          const paymentStatus = await getPaymentStatus(txRef);
          resolvedTransactionId = paymentStatus.transactionId;
        }

        const payment = resolvedTransactionId
          ? await waitForPaymentVerification(
              { transactionId: resolvedTransactionId, txRef },
              { attempts: 120, interval: 1500 },
            )
          : await waitForPaymentCompletion(txRef, {
              attempts: 120,
              interval: 1500,
            });

        await handlePaymentWindowResult({
          movieId: payment.movieId,
          status: "successful",
          transactionId: payment.transactionId,
          txRef,
        });
      } catch (error) {
        if (handledPaymentRef.current === txRef) return;

        const pendingPayment = getPendingPayment();
        if (pendingPayment?.txRef !== txRef) return;

        await handlePaymentWindowResult({
          message: error?.message || "Payment could not be confirmed.",
          status: "failed",
          txRef,
        });
      }
    },
    [handlePaymentWindowResult],
  );

  const redirectToCheckout = useCallback(
    ({ decision, hadSavedCard, method, movie, paymentWindow, result }) => {
      const checkoutUrl = result.checkoutUrl || result.redirectUrl || result.url;

      if (!checkoutUrl) {
        throw new Error("Payment checkout is unavailable.");
      }

      const pendingPayment = {
        hadSavedCard: Boolean(hadSavedCard),
        method,
        movieId: getMovieId(movie),
        movieTitle: movie?.title || decision?.movie?.title,
        openedInPopup: true,
        returnPath: getPlaybackReturnPath(
          location.pathname,
          location.search,
        ),
        txRef: result.txRef,
        transactionId: result.transactionId,
      };
      if (
        !savePendingPayment(pendingPayment) ||
        !savePendingPayment(pendingPayment, paymentWindow)
      ) {
        throw new Error("The secure payment window could not be prepared.");
      }
      redirectToExternalCheckout(checkoutUrl, paymentWindow);
      void watchExternalPayment(result.txRef, result.transactionId);
    },
    [location.pathname, location.search, watchExternalPayment],
  );

  useEffect(() => {
    const pendingPayment = getPendingPayment();

    if (
      pendingPayment?.txRef &&
      pendingPayment.method === "saved_card"
    ) {
      void watchExternalPayment(
        pendingPayment.txRef,
        pendingPayment.transactionId,
      );
    }
  }, [watchExternalPayment]);

  const startInlinePayment = useCallback(
    async (movie, decision, { hadSavedCard = false } = {}) => {
      const movieId = getMovieId(movie);
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setFlow((current) => ({ ...current, phase: "payment-processing" }));
      let txRef;

      try {
        const result = await initializeInlinePayment(
          movieId,
          createPaymentIdempotencyKey(movieId, "inline"),
        );
        if (requestIdRef.current !== requestId) return;
        txRef = result.txRef;

        const pendingPayment = {
          hadSavedCard: Boolean(hadSavedCard),
          method: "hosted_card",
          movieId,
          movieTitle: movie?.title || decision?.movie?.title,
          openedInPopup: false,
          returnPath: getPlaybackReturnPath(
            location.pathname,
            location.search,
          ),
          txRef,
        };
        if (!savePendingPayment(pendingPayment)) {
          throw new Error("The secure payment session could not be prepared.");
        }

        const inlinePayment = await openFlutterwaveInline({
          ...result,
          movieTitle: pendingPayment.movieTitle,
        });
        if (requestIdRef.current !== requestId) return;

        const transactionId = String(
          inlinePayment?.transaction_id || inlinePayment?.id || "",
        );
        if (!transactionId || inlinePayment?.status !== "successful") {
          throw new Error("Payment was not completed.");
        }

        savePendingPayment({ ...pendingPayment, transactionId });
        const completedPayment = await waitForPaymentVerification(
          { transactionId, txRef },
          { attempts: 30, interval: 2000 },
        );
        if (requestIdRef.current !== requestId) return;

        await handlePaymentWindowResult({
          movieId: completedPayment.movieId || movieId,
          status: "successful",
          transactionId,
          txRef,
        });
      } catch (error) {
        if (requestIdRef.current !== requestId) return;

        if (error?.data?.code === "ACTIVE_ACCESS") {
          await openPlayback(movie, movieId, requestId);
          return;
        }

        if (error instanceof FlutterwaveInlineCancelledError) {
          if (txRef) {
            await closePaymentAttempt({
              providerStatus: "cancelled",
              txRef,
            }).catch(() => undefined);
          }
          clearPendingPayment();
          setFlow({ phase: "purchase", movie, decision, error: "" });
          return;
        }

        setFlow({
          phase: "error",
          movie,
          decision,
          error: error?.message || "We could not complete payment checkout.",
        });
      }
    },
    [
      handlePaymentWindowResult,
      location.pathname,
      location.search,
      openPlayback,
    ],
  );

  const beginPurchase = useCallback(async () => {
    const movie = flow.movie;
    const decision = flow.decision;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setFlow((current) => ({ ...current, phase: "payment-loading" }));

    try {
      const response = await getSavedPaymentMethod();
      if (requestIdRef.current !== requestId) return;

      if (response?.tokenPayload?._id) {
        if (response.tokenStatus?.active === false) {
          setFlow((current) => ({
            ...current,
            phase: "payment-refresh",
            savedPayment: response.tokenPayload,
            tokenStatus: response.tokenStatus,
          }));
          return;
        }

        setFlow((current) => ({
          ...current,
          phase: "payment-choice",
          savedPayment: response.tokenPayload,
        }));
        return;
      }

      await startInlinePayment(movie, decision, {
        hadSavedCard: false,
      });
    } catch (error) {
      if (requestIdRef.current !== requestId) return;

      setFlow({
        phase: "error",
        movie,
        decision,
        error: error?.message || "We could not load your payment options.",
      });
    }
  }, [flow.decision, flow.movie, startInlinePayment]);

  const payWithSavedCard = useCallback(async () => {
    const movie = flow.movie;
    const decision = flow.decision;
    const movieId = getMovieId(movie);
    const paymentWindow = preparePaymentWindow();

    if (!paymentWindow) {
      setFlow({
        phase: "error",
        movie,
        decision,
        error: "Allow payment popups in your browser and try again.",
      });
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setFlow((current) => ({ ...current, phase: "payment-processing" }));

    try {
      const result = await chargeSavedCard(
        movieId,
        createPaymentIdempotencyKey(movieId, "saved"),
      );
      if (requestIdRef.current !== requestId) {
        closePaymentWindow(paymentWindow);
        return;
      }

      if (result.code === "AUTHORIZATION_REQUIRED") {
        redirectToCheckout({
          decision,
          hadSavedCard: true,
          method: "saved_card",
          movie,
          paymentWindow,
          result,
        });
        return;
      }

      if (result.transactionId && result.txRef) {
        closePaymentWindow(paymentWindow);
        paymentWindowRef.current = null;
        await completePaymentAndPlay({
          movie,
          movieId,
          requestId,
          transactionId: result.transactionId,
          txRef: result.txRef,
        });
        return;
      }

      throw new Error("Saved-card payment is still processing.");
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        closePaymentWindow(paymentWindow);
        return;
      }

      if (
        error?.data?.code === "NO_SAVED_CARD" ||
        error?.data?.code === "SAVED_CARD_EXPIRED"
      ) {
        closePaymentWindow(paymentWindow);
        paymentWindowRef.current = null;
        setFlow((current) => ({
          ...current,
          phase: "payment-refresh",
          tokenStatus: {
            active: false,
            reason: error?.data?.code,
            refreshRequired: true,
          },
        }));
        return;
      }

      closePaymentWindow(paymentWindow);
      paymentWindowRef.current = null;

      setFlow({
        phase: "error",
        movie,
        decision,
        error: error?.message || "Saved-card payment failed.",
      });
    }
  }, [
    completePaymentAndPlay,
    flow.decision,
    flow.movie,
    preparePaymentWindow,
    redirectToCheckout,
  ]);

  const confirmFreeClaim = useCallback(async () => {
    const movie = flow.movie;
    const movieId = getMovieId(movie);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setFlow((current) => ({ ...current, phase: "claiming", error: "" }));

    try {
      const decision = await claimFreeMovie(movieId);
      if (requestIdRef.current !== requestId) return;

      if (decision.action !== "PLAY") {
        setFlow({
          phase: decision.action === "PURCHASE" ? "purchase" : "error",
          movie,
          decision,
          error:
            decision.action === "PURCHASE"
              ? ""
              : "Free access is no longer available for this title.",
        });
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog", "home"] }),
      ]);
      queryClient.setQueryData(getWatchAccessQueryKey(movieId), decision);
      await openPlayback(movie, movieId, requestId);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;

      if (error?.status === 401 || error?.status === 403) {
        setFlow(IDLE_FLOW);
        redirectToSignIn(movie, "watch");
        return;
      }

      setFlow({
        phase: "error",
        movie,
        decision: flow.decision,
        error: error?.message || "We could not claim this movie.",
      });
    }
  }, [flow.decision, flow.movie, openPlayback, queryClient, redirectToSignIn]);

  const closeFlow = useCallback(() => {
    requestIdRef.current += 1;
    closeActivePaymentWindow();
    if (flow.phase === "payment-processing") {
      clearPendingPayment();
      clearPaymentResult();
    }
    setFlow(IDLE_FLOW);
  }, [closeActivePaymentWindow, flow.phase]);

  const continueAfterCardChoice = useCallback(async () => {
    const completion = flow.paymentCompletion;
    if (!completion) return;
    await startVerifiedPaymentPlayback(completion);
  }, [flow.paymentCompletion, startVerifiedPaymentPlayback]);

  const saveCardAndContinue = useCallback(async () => {
    const completion = flow.paymentCompletion;
    if (!completion?.transactionId) return;
    const isReplacingCard = flow.phase === "replace-card";

    setFlow((current) => ({ ...current, phase: "saving-card", error: "" }));

    try {
      await savePaymentMethod({
        isNewCard: true,
        transactionId: completion.transactionId,
      });
      showNotice(
        isReplacingCard
          ? "Saved card updated successfully"
          : "Card saved successfully",
      );
      await startVerifiedPaymentPlayback(completion);
    } catch (error) {
      setFlow((current) => ({
        ...current,
        phase: "card-save-error",
        error:
          error?.message ||
          "Your payment succeeded, but the card could not be saved.",
      }));
    }
  }, [
    flow.paymentCompletion,
    flow.phase,
    showNotice,
    startVerifiedPaymentPlayback,
  ]);

  const retryFlow = useCallback(() => {
    const movie = flow.movie;
    closeFlow();
    startWatch(movie);
  }, [closeFlow, flow.movie, startWatch]);

  const value = useMemo(
    () => ({
      activeMovieId: getMovieId(flow.movie),
      isBusy: ["checking", "claiming", "starting"].includes(flow.phase),
      startWatch,
    }),
    [flow.movie, flow.phase, startWatch],
  );

  return (
    <WatchFlowContext.Provider value={value}>
      {children}
      {notice ? (
        <div aria-live="polite" className="watch-flow-toast" role="status">
          <CheckCircle2 aria-hidden="true" size={20} strokeWidth={2.1} />
          <span>{notice}</span>
        </div>
      ) : null}
      {flow.phase !== "idle" ? (
        <WatchFlowDialog
          flow={flow}
          onClose={closeFlow}
          onContinueAfterPayment={continueAfterCardChoice}
          onConfirmFree={confirmFreeClaim}
          onPayWithNewCard={() =>
            startInlinePayment(flow.movie, flow.decision, {
              hadSavedCard: true,
            })
          }
          onPayWithSavedCard={payWithSavedCard}
          onPurchase={beginPurchase}
          onRetry={retryFlow}
          onSaveCard={saveCardAndContinue}
        />
      ) : null}
    </WatchFlowContext.Provider>
  );
}

export function useWatchFlow() {
  const context = useContext(WatchFlowContext);

  if (!context) {
    throw new Error("useWatchFlow must be used inside WatchFlowProvider");
  }

  return context;
}

function getMovieId(movie) {
  return String(movie?.backendId || movie?.id || movie?.slug || "");
}

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}

function getPlaybackReturnPath(pathname, search) {
  const params = new URLSearchParams(search);
  params.delete("watch");
  const normalizedSearch = params.toString();

  return `${pathname}${normalizedSearch ? `?${normalizedSearch}` : ""}`;
}

export default WatchFlowProvider;
