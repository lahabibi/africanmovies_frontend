import { LoaderCircle } from "lucide-react";

function PaymentProcessing() {
  return (
    <main className="payment-return">
      <section
        aria-busy={true}
        className="payment-return__card payment-return__card--processing"
      >
        <span className="payment-return__icon" aria-hidden="true">
          <LoaderCircle className="payment-return__spinner" />
        </span>
        <h1>Preparing secure payment</h1>
        <p>This window will continue to Flutterwave automatically.</p>
      </section>
    </main>
  );
}

export default PaymentProcessing;
