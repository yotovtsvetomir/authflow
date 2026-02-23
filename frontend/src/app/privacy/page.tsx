export default function PrivacyPolicy() {
  return (
    <div className="fullHeight" style={{ background: "var(--color-neutral-400)", paddingBottom: '2rem' }}>
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
        <h1
          style={{
            fontSize: "var(--font-3xl)",
            marginBottom: "1.1rem",
            color: "var(--color-highlight-1)",
          }}
        >
          Privacy Policy (English)
        </h1>
        <p>Last updated: June 11, 2025</p>

        {[
          {
            title: "1. Introduction",
            content:
              "This website (“Authflow”, “we”, “us”) is committed to protecting your privacy. This privacy policy explains how we collect, use, and safeguard your information.",
          },
          {
            title: "2. What information do we collect?",
            list: ["Email address", "First and last name (if provided by Facebook/Google)", "Other data you voluntarily provide while using our service"],
          },
          {
            title: "3. How do we use your information?",
            list: [
              "To register and identify you in “Moyata Pokana”",
              "To send you important messages related to your registration or our services",
              "To improve our service and user experience",
            ],
          },
          {
            title: "4. Information sharing",
            content: "Your personal data is not shared with third parties unless required by law or necessary to provide our service.",
          },
          {
            title: "5. Data protection",
            content: "We take reasonable steps to protect your information. However, we cannot guarantee absolute security of data transmitted over the Internet.",
          },
          {
            title: "6. Your rights",
            content:
              <>
                You may at any time request access to, correction, or deletion of your personal data by contacting us at:{" "}
                <a
                  href="mailto:support@moyatapokana.bg"
                  style={{ color: "var(--color-highlight-1)", textDecoration: "underline" }}
                >
                  support@authflow.com
                </a>
              </>,
          },
          {
            title: "7. Changes to this policy",
            content: "We reserve the right to update this privacy policy. Any changes will be posted on this page.",
          },
        ].map((section, idx) => (
          <div key={idx}>
            <h2
              style={{
                fontSize: "var(--font-lg)",
                marginTop: "2rem",
                marginBottom: "0.7rem",
                color: "var(--color-highlight-1)",
                fontWeight: "var(--font-weight-semi)",
              }}
            >
              {section.title}
            </h2>
            {section.list ? (
              <ul style={{ paddingLeft: "1.3rem", marginBottom: "1rem", lineHeight: 1.7 }}>
                {section.list.map((item, i) => (
                  <li key={i} style={{ fontSize: "var(--font-md)", marginBottom: "0.45rem" }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "var(--font-md)", lineHeight: 1.7 }}>{section.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
