import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import {
  confirmPayment,
  waitForPaymentCompletion,
} from "../api/paymentApi";
import { createPlaybackSession } from "../api/watchApi";
import {
  clearPendingPayment,
  getPendingPayment,
} from "../utils/pendingPayment";

function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasRunRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState({
    phase: "verifying",
    message: "Confirming your payment securely.",
  });

  const processPayment = useCallback(async () => {
    const params = new URLSearchParams(location.search);
    const providerStatus = params.get("status");
    const transactionId = params.get("transaction_id");
    const txRef = params.get("tx_ref");
    const pendingPayment = getPendingPayment();

    if (!getAuthToken()) {
      navigate("/signin", {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    if (providerStatus && providerStatus !== "successful") {
      setState({
        phase: "cancelled",
        message: "No charge was completed. You can return and try again.",
      });
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

      setState({
        phase: "success",
        message: "Payment confirmed. Starting your movie.",
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog", "home"] }),
        queryClient.invalidateQueries({ queryKey: ["watch-access"] }),
      ]);

      const playbackSession = await createPlaybackSession(movieId);
      clearPendingPayment();
      navigate(`/playback/${movieId}`, {
        replace: true,
        state: {
          from: pendingPayment?.returnPath || `/movies/${movieId}`,
          movie: {
            id: movieId,
            slug: movieId,
            title:
              pendingPayment?.movieTitle || playbackSession.movie?.title,
          },
          playbackSession,
        },
      });
    } catch (error) {
      setState({
        phase: "error",
        message: error?.message || "We could not confirm this payment.",
      });
    }
  }, [location.pathname, location.search, navigate, queryClient]);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    processPayment();
  }, [processPayment, retryCount]);

  const retry = () => {
    hasRunRef.current = false;
    setRetryCount((value) => value + 1);
  };

  const pendingPayment = getPendingPayment();
  const returnPath = pendingPayment?.returnPath || "/";
  const isLoading = state.phase === "verifying" || state.phase === "success";

  return (
    <main className="payment-return">
      <section
        aria-busy={isLoading || undefined}
        className={`payment-return__card payment-return__card--${state.phase}`}
      >
        <span className="payment-return__icon" aria-hidden="true">
          {state.phase === "verifying" ? (
            <LoaderCircle className="payment-return__spinner" />
          ) : state.phase === "success" ? (
            <CheckCircle2 />
          ) : (
            <AlertCircle />
          )}
        </span>

        <h1>{getStateTitle(state.phase)}</h1>
        <p>{state.message}</p>

        {!isLoading ? (
          <div className="payment-return__actions">
            <button onClick={() => navigate(returnPath)} type="button">
              <ArrowLeft aria-hidden="true" size={18} />
              Back to movie
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
  if (phase === "error") return "Payment could not be confirmed";
  return "Verifying payment";
}

export default PaymentCallback;
