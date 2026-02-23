import { useState } from "react";
import { components } from "@/shared/types";

type RegisterFormValues = components["schemas"]["UserCreate"];

type RegisterFormErrors = {
  [K in keyof RegisterFormValues]?: string;
} & {
  confirmPassword?: string;
  apiError?: string;
};

interface UseRegisterOptions {
  redirectTo?: string;
}

export function useRegister({ redirectTo = "/profile" }: UseRegisterOptions = {}) {
  const [values, setValues] = useState<RegisterFormValues>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fbReady] = useState(true);

  const validate = () => {
    const newErrors: RegisterFormErrors = {};

    if (!values.first_name || values.first_name.length < 2) {
      newErrors.first_name = "First name must be at least 2 characters";
    }

    if (!values.last_name || values.last_name.length < 2) {
      newErrors.last_name = "Last name must be at least 2 characters";
    }

    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "Email must be valid";
    }

    if (!values.password || values.password.length < 7) {
      newErrors.password = "Password must be at least 7 characters";
    }

    if (values.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value } as RegisterFormValues);
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleFocus = (field: keyof RegisterFormErrors) => () => {
    setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setLoading(true);

    const body = {
      ...values,
      redirect_to: redirectTo,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (Array.isArray(data.error) && data.error.length > 0) {
          const rawMsg = data.error[0].msg;
          const cleanedMsg = rawMsg.replace(/^Value error, /, "");
          setErrors({ apiError: cleanedMsg });
        } else if (typeof data.error === "string") {
          setErrors({ apiError: data.error });
        } else {
          setErrors({ apiError: "Registration failed" });
        }
        return;
      }

      setSuccess(true);

      window.location.href = `/login?from=${encodeURIComponent(redirectTo)}`;
    } catch (error) {
      setErrors({
        apiError: error instanceof Error ? error.message : "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/google-callback`;
    const scope = "openid email profile";
    const responseType = "code";

    const state = encodeURIComponent(JSON.stringify({ from: redirectTo }));

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;
    window.open(url, "google-login", "width=500,height=600");
  };

  const handleFacebookRegister = () => {
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
    values,
    confirmPassword,
    errors,
    loading,
    success,
    fbReady,
    handleChange,
    handleConfirmChange,
    handleFocus,
    handleSubmit,
    handleGoogleRegister,
    handleFacebookRegister,
  };
}
