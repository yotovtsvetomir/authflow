export default function CookiesPolicy() {
  return (
    <div className="fullHeight" style={{ background: "var(--color-neutral-400)", paddingBottom: "2rem" }}>
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "2.5rem 2rem",
          background: "var(--color-neutral-500)",
          borderRadius: 18,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          fontFamily: "var(--font-sans)",
          color: "var(--color-dark-200)",
          position: "relative",
        }}
      >
        <h1 style={{ fontSize: "var(--font-3xl)", marginBottom: "1.1rem", color: "var(--color-highlight-1)" }}>
          Cookies Policy
        </h1>
        <p>Last updated: June 11, 2025</p>

        <h2 style={{ fontSize: "var(--font-lg)", marginTop: "2rem", marginBottom: "0.7rem", color: "var(--color-highlight-1)", fontWeight: "var(--font-weight-semi)" }}>
          1. What are cookies?
        </h2>
        <p style={{ fontSize: "var(--font-md)", lineHeight: 1.7 }}>
          Cookies are small text files stored on your device to improve your browsing experience, analyze website traffic, and remember your preferences.
        </p>

        <h2 style={{ fontSize: "var(--font-lg)", marginTop: "2rem", marginBottom: "0.7rem", color: "var(--color-highlight-1)", fontWeight: "var(--font-weight-semi)" }}>
          2. How do we use cookies?
        </h2>
        <ul style={{ paddingLeft: "1.3rem", marginBottom: "1rem", lineHeight: 1.7 }}>
          <li style={{ fontSize: "var(--font-md)", marginBottom: "0.45rem" }}>
            To keep your session active and provide personalized experience (session cookies)
          </li>
          <li style={{ fontSize: "var(--font-md)", marginBottom: "0.45rem" }}>
            For analytics and website improvement
          </li>
          <li style={{ fontSize: "var(--font-md)", marginBottom: "0.45rem" }}>
            To store your preferences and settings
          </li>
        </ul>

        <h2 style={{ fontSize: "var(--font-lg)", marginTop: "2rem", marginBottom: "0.7rem", color: "var(--color-highlight-1)", fontWeight: "var(--font-weight-semi)" }}>
          3. How to manage cookies?
        </h2>
        <p style={{ fontSize: "var(--font-md)", lineHeight: 1.7 }}>
          You can control or delete cookies through your browser settings. Please note that disabling session cookies may prevent the website from functioning correctly.
        </p>
      </div>
    </div>
  );
}
