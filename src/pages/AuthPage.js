import {
  Headphones,
  LockKeyhole,
  Mail,
  MonitorSmartphone,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthStoryPanel from "../components/auth/AuthStoryPanel";
import { useRequestOtp } from "../hooks/useAuth";

const trustItems = [
  { icon: LockKeyhole, label: "Secure & Private" },
  { icon: MonitorSmartphone, label: "Stream on any device" },
  { icon: Headphones, label: "24/7 Support" },
];

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignUp = location.pathname === "/signup";
  const title = isSignUp ? "Create account" : "Welcome back";
  const subtitle = isSignUp
    ? "Start watching African stories today"
    : "Sign in to your account";
  const initialEmail = location.state?.email || "";
  const sessionMessage = location.state?.sessionMessage;
  const [email, setEmail] = useState(initialEmail);
  const [errorMessage, setErrorMessage] = useState("");
  const requestOtpMutation = useRequestOtp();

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextEmail = email.trim();

    if (!nextEmail) {
      return;
    }

    setErrorMessage("");
    requestOtpMutation.mutate(nextEmail, {
      onSuccess: () => {
        navigate("/otp", {
          state: {
            email: nextEmail,
            from: location.state?.from,
          },
        });
      },
      onError: (error) => {
        setErrorMessage(error.message);
      },
    });
  };

  return (
    <main className="auth-page">
      <AuthStoryPanel />

      <section className="auth-panel-section" aria-label={title}>
        <div className="auth-card">
          <div className="auth-card__heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {sessionMessage ? (
            <p className="auth-session-notice" role="status">
              {sessionMessage}
            </p>
          ) : null}

          <div className="auth-envelope" aria-hidden="true">
            <span className="auth-envelope__burst" />
            <Mail size={62} strokeWidth={1.8} />
            <span className="auth-envelope__send">
              <Send size={22} strokeWidth={2.3} />
            </span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="auth-email">Enter your email</label>
            <div className="auth-input">
              <Mail aria-hidden="true" size={23} strokeWidth={1.8} />
              <input
                id="auth-email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                required
                type="email"
                value={email}
              />
            </div>

            {errorMessage ? (
              <p className="auth-form__error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button disabled={requestOtpMutation.isPending} type="submit">
              {requestOtpMutation.isPending ? "Sending code..." : "Continue"}
            </button>
          </form>

          <div className="auth-note">
            <span />
            <LockKeyhole aria-hidden="true" size={20} strokeWidth={1.8} />
            <p>We'll send you a one-time code to your email</p>
            <span />
          </div>

          <p className="auth-switch">
            We will never share your email with anyone.
          </p>
        </div>

        <div className="auth-trust-bar" aria-label="Trust and support">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div className="auth-trust-bar__item" key={item.label}>
                <Icon aria-hidden="true" size={25} strokeWidth={1.8} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
