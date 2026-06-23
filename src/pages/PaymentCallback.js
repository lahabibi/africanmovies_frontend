import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import {
  closePaymentAttempt,
  confirmPayment,
  getSavedPaymentMethod,
  savePaymentMethod,
  waitForPaymentCompletion,
} from "../api/paymentApi";
import { createPlaybackSession } from "../api/watchApi";
import {
  clearPendingPayment,
  closePaymentWindow,
  getPendingPayment,
  isPaymentWindow,
  publishPaymentResult,
} from "../utils/pendingPayment";

function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasRunRef = useRef(false);
  const completionRef = useRef(null);
  const cardPromptRef = useRef("save-card");
  const pendingPaymentRef = useRef(getPendingPayment());
  const isPopupRef = useRef(
    isPaymentWindow() || pendingPaymentRef.current?.openedInPopup === true,
  );
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState({
    phase: "verifying",
    message: "Confirming your payment securely.",
  });

  const continueToPlayback = useCallback(
    async (completion = completionRef.current) => {
      if (!completion?.movieId) {
        setState({
          phase: "error",
          message: "Payment completed, but the movie could not be found.",
        });
        return;
      }

      setState({
        phase: "success",
        message: isPopupRef.current
          ? "Payment confirmed. Returning to your movie."
          : "Payment confirmed. Starting your movie.",
      });

      try {
        if (isPopupRef.current) {
          publishPaymentResult({
            movieId: completion.movieId,
            movieTitle: completion.pendingPayment?.movieTitle,
            status: "successful",
            txRef: completion.txRef || completion.pendingPayment?.txRef,
          });
          clearPendingPayment();
          window.setTimeout(() => closePaymentWindow(window), 250);
          return;
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["orders"] }),
          queryClient.invalidateQueries({ queryKey: ["payments"] }),
          queryClient.invalidateQueries({ queryKey: ["catalog", "home"] }),
          queryClient.invalidateQueries({ queryKey: ["watch-access"] }),
        ]);

        const playbackSession = await createPlaybackSession(completion.movieId);
        clearPendingPayment();
        navigate(`/playback/${completion.movieId}`, {
          replace: true,
          state: {
            from:
              completion.pendingPayment?.returnPath ||
              `/movies/${completion.movieId}`,
            movie: {
              id: completion.movieId,
              slug: completion.movieId,
              title:
                completion.pendingPayment?.movieTitle ||
                playbackSession.movie?.title,
            },
            playbackSession,
          },
        });
      } catch (error) {
        setState({
          phase: "error",
          message: error?.message || "Payment completed, but playback could not start.",
        });
      }
    },
    [navigate, queryClient],
  );

  const processPayment = useCallback(async () => {
    const params = new URLSearchParams(location.search);
    const providerStatus = params.get("status");
    const transactionId = params.get("transaction_id");
    const txRef = params.get("tx_ref");
    const pendingPayment = pendingPaymentRef.current;

    if (!getAuthToken()) {
      navigate("/signin", {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    if (providerStatus && providerStatus !== "successful") {
      let closedAttempt = null;

      if (txRef) {
        closedAttempt = await closePaymentAttempt({
          providerStatus,
          txRef,
        }).catch(() => null);
      }

      if (closedAttempt?.code === "PAYMENT_COMPLETED") {
        const completion = {
          movieId: closedAttempt.movieId || pendingPayment?.movieId,
          pendingPayment,
          transactionId:
            closedAttempt.transactionId || transactionId,
          txRef,
        };
        completionRef.current = completion;
        await continueToPlayback(completion);
        return;
      }

      if (closedAttempt?.code === "PAYMENT_ATTEMPT_CLOSED") {
        clearPendingPayment();
        queryClient.invalidateQueries({ queryKey: ["payments"] });
      }

      const wasCancelled = providerStatus === "cancelled";
      setState({
        phase: wasCancelled ? "cancelled" : "failed",
        message: wasCancelled
          ? "No charge was completed. You can return and try again."
          : "The payment did not go through. You can return and try again.",
      });

      if (isPopupRef.current) {
        publishPaymentResult({
          message: wasCancelled
            ? "Payment was cancelled."
            : "Payment did not go through.",
          status: wasCancelled ? "cancelled" : "failed",
          txRef: txRef || pendingPayment?.txRef,
        });
        clearPendingPayment();
        window.setTimeout(() => closePaymentWindow(window), 700);
      }
      return;
    }

    if (!txRef || !transactionId) {
      setState({
        phase: "error",
        message: "The payment response is missing required information.",
      });
      return;
    }

    setState({
      phase: "verifying",
      message: "Confirming your payment securely.",
    });

    try {
      let completedPayment;

      try {
        completedPayment = await confirmPayment({ transactionId, txRef });
      } catch (error) {
        if (
          error?.data?.code !== "PAYMENT_NOT_VERIFIED" &&
          error?.data?.code !== "PAYMENT_PROVIDER_UNAVAILABLE"
        ) {
          throw error;
        }

        completedPayment = await waitForPaymentCompletion(txRef, {
          attempts: 10,
          interval: 1500,
        });
      }

      const movieId = completedPayment?.movieId || pendingPayment?.movieId;
      if (!movieId) {
        throw new Error("Payment completed, but the movie could not be found.");
      }

      const completion = {
        movieId,
        pendingPayment,
        transactionId,
        txRef,
      };
      completionRef.current = completion;

      const isHostedPayment =
        pendingPayment?.method === "hosted_card" ||
        (!pendingPayment?.method && location.pathname === "/process-payment");

      if (!isHostedPayment) {
        await continueToPlayback(completion);
        return;
      }

      let hadSavedCard = pendingPayment?.hadSavedCard;
      if (typeof hadSavedCard !== "boolean") {
        const savedPayment = await getSavedPaymentMethod().catch(() => null);
        hadSavedCard = Boolean(savedPayment?.tokenPayload?._id);
      }

      const promptPhase = hadSavedCard ? "replace-card" : "save-card";
      cardPromptRef.current = promptPhase;
      setState({
        phase: promptPhase,
        message: hadSavedCard
          ? "Replace your saved card with the card used for this payment?"
          : "Save the card used for faster payments next time?",
      });
    } catch (error) {
      setState({
        phase: "error",
        message: error?.message || "We could not confirm this payment.",
      });
    }
  }, [
    continueToPlayback,
    location.pathname,
    location.search,
    navigate,
    queryClient,
  ]);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    processPayment();
  }, [processPayment, retryCount]);

  const retry = () => {
    hasRunRef.current = false;
    setRetryCount((value) => value + 1);
  };

  const saveCardAndContinue = async () => {
    const completion = completionRef.current;
    if (!completion?.transactionId) return;

    setState({
      phase: "saving-card",
      message: "Saving your payment method securely.",
    });

    try {
      await savePaymentMethod({
        isNewCard: true,
        transactionId: completion.transactionId,
      });
      await continueToPlayback(completion);
    } catch (error) {
      setState({
        phase: "card-save-error",
        message:
          error?.message ||
          "Your payment succeeded, but the card could not be saved.",
      });
    }
  };

  const pendingPayment = pendingPaymentRef.current;
  const returnPath = pendingPayment?.returnPath || "/";
  const exitPayment = () => {
    if (isPopupRef.current) {
      publishPaymentResult({
        message: state.message,
        status: state.phase === "cancelled" ? "cancelled" : "failed",
        txRef: pendingPayment?.txRef,
      });
      closePaymentWindow(window);
      return;
    }

    navigate(returnPath);
  };
  const isLoading = ["verifying", "success", "saving-card"].includes(
    state.phase,
  );
  const isCardPrompt = ["save-card", "replace-card"].includes(state.phase);

  return (
    <main className="payment-return">
      <section
        aria-busy={isLoading || undefined}
        className={`payment-return__card payment-return__card--${state.phase}`}
      >
        <span className="payment-return__icon" aria-hidden="true">
          {isLoading ? (
            <LoaderCircle className="payment-return__spinner" />
          ) : state.phase === "success" ? (
            <CheckCircle2 />
          ) : isCardPrompt ? (
            state.phase === "replace-card" ? <RefreshCw /> : <CreditCard />
          ) : (
            <AlertCircle />
          )}
        </span>

        <h1>{getStateTitle(state.phase)}</h1>
        <p>{state.message}</p>

        {isCardPrompt ? (
          <div className="payment-return__actions">
            <button onClick={() => continueToPlayback()} type="button">
              Not now
            </button>
            <button
              className="is-primary"
              onClick={saveCardAndContinue}
              type="button"
            >
              {state.phase === "replace-card" ? "Replace card" : "Save card"}
            </button>
          </div>
        ) : null}

        {state.phase === "card-save-error" ? (
          <div className="payment-return__actions">
            <button onClick={() => continueToPlayback()} type="button">
              Continue without saving
            </button>
            <button
              className="is-primary"
              onClick={() => {
                setState({
                  phase: cardPromptRef.current,
                  message:
                    cardPromptRef.current === "replace-card"
                      ? "Replace your saved card with the card used for this payment?"
                      : "Save the card used for faster payments next time?",
                });
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!isLoading && !isCardPrompt && state.phase !== "card-save-error" ? (
          <div className="payment-return__actions">
            <button onClick={exitPayment} type="button">
              <ArrowLeft aria-hidden="true" size={18} />
              {isPopupRef.current ? "Close window" : "Back to movie"}
            </button>
            {state.phase === "error" ? (
              <button className="is-primary" onClick={retry} type="button">
                <RotateCcw aria-hidden="true" size={18} />
                Try again
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function getStateTitle(phase) {
  if (phase === "success") return "Payment confirmed";
  if (phase === "cancelled") return "Payment cancelled";
  if (phase === "failed") return "Payment failed";
  if (phase === "error") return "Payment could not be confirmed";
  if (phase === "save-card") return "Save this card?";
  if (phase === "replace-card") return "Replace saved card?";
  if (phase === "saving-card") return "Saving card";
  if (phase === "card-save-error") return "Card was not saved";
  return "Verifying payment";
}

export default PaymentCallback;
