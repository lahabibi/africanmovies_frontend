import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import mailIcon from "../assets/icons/ic_mail.png";
import mailOkIcon from "../assets/icons/ic_mail_ok.png";
import securityIcon from "../assets/icons/ic_security.png";
import AuthStoryPanel from "../components/auth/AuthStoryPanel";

const OTP_LENGTH = 6;
const DEFAULT_EMAIL = "john.doe@email.com";

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(45);
  const email = location.state?.email || DEFAULT_EMAIL;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const focusInput = (index) => {
    window.requestAnimationFrame(() => {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    });
  };

  const applyDigits = (value, startIndex = 0) => {
    const cleanValue = value
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH - startIndex);

    if (!cleanValue) {
      return;
    }

    setDigits((currentDigits) => {
      const nextDigits = [...currentDigits];

      cleanValue.split("").forEach((digit, offset) => {
        nextDigits[startIndex + offset] = digit;
      });

      return nextDigits;
    });

    focusInput(Math.min(startIndex + cleanValue.length, OTP_LENGTH - 1));
  };

  const handleChange = (event, index) => {
    const cleanValue = event.target.value.replace(/\D/g, "");

    if (cleanValue.length > 1) {
      applyDigits(cleanValue, index);
      return;
    }

    setDigits((currentDigits) => {
      const nextDigits = [...currentDigits];
      nextDigits[index] = cleanValue;
      return nextDigits;
    });

    if (cleanValue && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event, index) => {
    event.preventDefault();
    applyDigits(event.clipboardData.getData("text"), index);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/signin");
  };

  const handleResendCode = () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(45);
    focusInput(0);
  };

  return (
    <main className="auth-page auth-page--otp">
      <AuthStoryPanel />

      <section
        className="auth-panel-section auth-panel-section--otp"
        aria-label="Check your email"
      >
        <div className="otp-card">
          <button className="otp-back" type="button" onClick={handleBack}>
            <ArrowLeft aria-hidden="true" size={24} strokeWidth={1.8} />
            Back
          </button>

          <div className="otp-card__body">
            <div className="otp-envelope" aria-hidden="true">
              <span className="auth-envelope__burst" />
              <span
                className="otp-envelope__icon"
                style={{ "--mail-ok-icon": `url(${mailOkIcon})` }}
              />
            </div>

            <div className="otp-card__heading">
              <h1>Check your email</h1>
              <p>
                We've sent a 6-digit verification code to
                <strong>{email}</strong>
              </p>
            </div>

            <form className="otp-form" onSubmit={handleSubmit}>
              <div
                className="otp-inputs"
                role="group"
                aria-label="Verification code"
              >
                {digits.map((digit, index) => (
                  <input
                    aria-label={`Digit ${index + 1} of verification code`}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    className="otp-input"
                    inputMode="numeric"
                    key={`otp-digit-${index + 1}`}
                    maxLength={OTP_LENGTH}
                    onChange={(event) => handleChange(event, index)}
                    onFocus={(event) => event.target.select()}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPaste={(event) => handlePaste(event, index)}
                    pattern="[0-9]*"
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    value={digit}
                  />
                ))}
              </div>
            </form>

            <p className="otp-resend">
              <span>Didn't receive the code?</span>
              <button
                disabled={secondsLeft > 0}
                onClick={handleResendCode}
                type="button"
              >
                Resend code
              </button>
              {secondsLeft > 0 && <span>({formatCountdown(secondsLeft)})</span>}
            </p>

            <div className="otp-warning">
              <span
                className="otp-warning__icon"
                style={{ "--security-icon": `url(${securityIcon})` }}
              />
              <p>
                <span>The code will expire in 10 minutes.</span>
                <span>Do not share this code with anyone.</span>
              </p>
            </div>

            <div className="otp-divider" aria-hidden="true">
              <span />
              <small>or</small>
              <span />
            </div>

            <Link className="otp-change-email" to="/signin" state={{ email }}>
              <img src={mailIcon} alt="" />
              Change email address
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OtpPage;
