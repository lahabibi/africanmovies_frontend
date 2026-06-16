import {
  Headphones,
  LockKeyhole,
  Mail,
  MonitorSmartphone,
  Send,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthStoryPanel from "../components/auth/AuthStoryPanel";

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
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "john.doe@email.com").trim();

    navigate("/otp", { state: { email } });
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
                defaultValue={initialEmail}
                name="email"
                placeholder="Enter your email address"
                required
                type="email"
              />
            </div>

            <button type="submit">Continue</button>
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
