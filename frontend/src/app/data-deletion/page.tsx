// app/data-deletion/page.tsx
export default function DataDeletionPage() {
  return (
    <div className="fullHeight">
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "2.5rem 1.5rem",
          background: "var(--color-neutral-500)",
          borderRadius: "16px",
          boxShadow: "0 4px 28px rgba(0,0,0,0.07)",
          fontFamily: "var(--font-sans)",
          color: "var(--color-dark-200)",
        }}
      >
        <h1
          style={{
            fontSize: "var(--font-3xl)",
            marginBottom: "1.2rem",
            color: "var(--color-highlight-1)",
          }}
        >
          Request Data Deletion / Account Removal
        </h1>
        <p style={{ fontSize: "var(--font-lgl)", marginBottom: "1.4rem" }}>
          If you would like to delete your account and all associated personal
          data from our service, please send an email request to:
        </p>
        <p
          style={{
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-lgl)",
            marginBottom: "2rem",
          }}
        >
          <a
            href="mailto:поддръжка@моятапокана.бг"
            style={{
              color: "var(--color-highlight-1)",
              textDecoration: "underline",
            }}
          >
            support@authflow.com
          </a>
        </p>
        <p style={{ fontSize: "var(--font-md)", color: "var(--color-dark-400)" }}>
          Please include the email address you registered with, and clearly state
          that you wish to have your account and data deleted.
          <br />
          <br />
          We will process your request as soon as possible and confirm by email
          once your data has been deleted.
        </p>
      </div>
    </div>
  );
}
