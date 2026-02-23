import styles from "./flow.module.css";

export const metadata = {
  title: "Authentication Architecture",
  description: "How Authflow authentication works with Next.js, FastAPI and Redis",
};

export default function FlowPage() {
  return (
    <div className={`container fullHeight centerWrapper ${styles.authFlow}`}>
      <section>
        <h1>How Authentication Works</h1>

        <p>
          Authflow uses a secure, cookie-based session architecture powered by{" "}
          <strong>Next.js (SSR)</strong> and <strong>FastAPI</strong>. 
          All authentication is validated server-side,
          ensuring full SSR compatibility and zero exposure to XSS token leaks.
        </p>

        <h2>🔐 Login Flow</h2>
        <ol>
          <li>User submits credentials</li>
          <li>Next.js API route forwards to FastAPI</li>
          <li>FastAPI verifies credentials and creates session</li>
          <li>Session stored in Redis</li>
          <li>Next.js sets secure httpOnly cookie</li>
          <li>Browser sends cookie automatically on future requests</li>
        </ol>

        <h2>⚡ Session Storage</h2>
        <ul>
          <li><strong>Redis:</strong> Fast session lookup</li>
          <li><strong>PostgreSQL:</strong> Persistent user data</li>
          <li><strong>PgBouncer:</strong> Efficient DB pooling</li>
        </ul>

        <h2>🛡 Authorization & Security</h2>
        <ul>
          <li>Role-Based Access Control (RBAC)</li>
          <li>403 Forbidden enforcement</li>
          <li>Admin route isolation</li>
          <li>Strict CORS configuration</li>
          <li>Backend as source of truth</li>
        </ul>

        <h2>🔄 Idle & Refresh Flow</h2>
        <ul>
          <li>Frontend tracks inactivity</li>
          <li>Timeout modal appears</li>
          <li>User refreshes session or logs out</li>
        </ul>

        <h2>🌍 Social Login Flow</h2>
        <ul>
          <li>OAuth popup authenticates user</li>
          <li>Next.js exchanges provider code</li>
          <li>FastAPI verifies token</li>
          <li>Session stored in Redis</li>
          <li>Secure cookie set</li>
        </ul>
      </section>
    </div>
  );
}
