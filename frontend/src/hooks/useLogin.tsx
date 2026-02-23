import { useState } from "react";

interface UseLoginOptions {
  redirectTo?: string;
}

export function useLogin({ redirectTo = "/profile" }: UseLoginOptions = {}) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fbReady] = useState(true);

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.email) errors.email = "Email is mandatory";
    if (!formData.password) errors.password = "Password is mandatory";
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (field: string) => () => {
    setFormErrors({ ...formErrors, [field]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormErrors({ apiError: data.error || data.detail || "Login failed" });
        return;
      }

      setSuccess(true);
      window.location.href = redirectTo;
    } catch (error) {
      setFormErrors({
        apiError: error instanceof Error ? error.message : "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- Social login with state ----------------------
  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/google-callback`;
    const scope = "openid email profile";
    const responseType = "code";

    // Pass dynamic redirectTo in state
    const state = encodeURIComponent(JSON.stringify({ from: redirectTo }));

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;
    window.open(url, "google-login", "width=500,height=600");
  };

  const handleFacebookLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/facebook-callback`;
    const scope = "email,public_profile";
    const responseType = "code";
    const authType = "rerequest";

    const state = encodeURIComponent(JSON.stringify({ from: redirectTo }));

    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&auth_type=${authType}&state=${state}`;
    window.open(url, "facebook-login", "width=500,height=600");
  };

  return {
    formData,
    formErrors,
    loading,
    success,
    fbReady,
    handleChange,
    handleFocus,
    handleSubmit,
    handleGoogleLogin,
    handleFacebookLogin,
  };
}
