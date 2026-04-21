import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-services";

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google script failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = GOOGLE_SCRIPT_ID;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed to load"));

    document.head.appendChild(script);
  });

const GoogleOAuthButton = ({
  onCredential,
  buttonText = "continue_with",
  className = "",
  disabled = false,
}) => {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [status, setStatus] = useState("loading");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let isMounted = true;

    if (!clientId) {
      setStatus("missing");
      return () => {
        isMounted = false;
      };
    }

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !window.google?.accounts?.id || !buttonRef.current) {
          return;
        }

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              callbackRef.current?.(response.credential);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: buttonText,
          width: Math.min(420, Math.max(280, buttonRef.current.offsetWidth || 360)),
        });

        setStatus("ready");
      })
      .catch(() => {
        if (isMounted) {
          setStatus("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, buttonText]);

  if (disabled) {
    return (
      <div className={className}>
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white/40"
        >
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {status === "missing" ? (
        <p className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-xs text-amber-100">
          Google OAuth is not configured.
        </p>
      ) : status === "error" ? (
        <p className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-center text-xs text-rose-100">
          Google sign-in failed to load.
        </p>
      ) : (
        <div ref={buttonRef} className="flex w-full justify-center" />
      )}
    </div>
  );
};

export default GoogleOAuthButton;