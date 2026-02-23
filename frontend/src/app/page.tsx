import Image from "next/image";
import styles from "./home.module.css";
import FlowDiagram from "@/assets/authflow.svg";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { Button } from "@/ui-components/Button/Button";
import ZoomableDiagram from "@/components/ZoomableDiagram/ZoomableDiagram";

export default function Page() {
  return (
    <div className={`container fullHeight centerWrapper ${styles.Home}`}>
      {/* HERO / INTRO */}
      <section className={styles.hero}>
        <h1>Authflow 🚀</h1>
        <p className={styles.subline}>
          Production-ready, full-stack authentication system with{" "}
          <strong>Next.js</strong>, <strong>FastAPI</strong>, <strong>Redis</strong>, and scalable PostgreSQL architecture.
        </p>
        <p className={styles.subline}>
          Manual login/register, social login (Google & Facebook), role-based protected pages, dynamic redirects, and SSR-safe sessions.
        </p>
      </section>

      {/* KEY FEATURES */}
      <section className={styles.tech}>
        <h1>Technology ⚡</h1>
        <ul>
          <li><strong>Fast & Efficient:</strong> Redis-backed session caching & shared user context</li>
          <li><strong>Enterprise Architecture:</strong> Primary-replica PostgreSQL + PgBouncer pooling.</li>
          <li><strong>Social Logins:</strong> Google & Facebook, dynamic redirects, auto user creation.</li>
          <li><strong>Session Management:</strong> Idle timeout modal, refresh, auto logout.</li>
          <li><strong>Protected Pages:</strong> Frontend + backend authorization, role-based access.</li>
          <li><strong>Developer-Friendly:</strong> OpenAPI → TypeScript shared types, Celery async tasks.</li>
        </ul>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className={styles.architecture}>
        <h1>Architecture Overview 🏗️</h1>
        <p>Click on the diagram to enlarge it</p>

        <ZoomableDiagram
          src={FlowDiagram}
          alt="Authflow Architecture Diagram"
        />
      </section>

      {/* DEMO FLOW */}
      <section id="use_case" className={styles.use_case}>
        <h1>Use Case 🔄</h1>
        <ol>
          <li>User is not logged in</li>
          <li>User clicks a blog page link</li>
          <li>The blog requires authentication → system redirects to login/register</li>
          <li>User logs in or registers (manual or social login)</li>
          <li>After authentication → user is redirected back to the page tried to access</li>
          <li>User clicks on profile picture → settings then adjust profile name and picture</li>
        </ol>
      </section>

      {/* ADMIN PANEL */}
      <section id="admin" className={styles.admin}>
        <h1>Admin Panel 🛠️</h1>

        <p>
          The project includes a fully protected <strong>Admin Dashboard </strong> 
          accessible only to users with the <strong>admin role</strong>.
        </p>

        <div className={styles.adminAccess}>
          <h3>Admin Credentials</h3>
          <ul>
            <li><strong>Username:</strong> t-yotov@teamyotov.com</li>
            <li><strong>Password:</strong> Admin!123</li>
          </ul>

          <Button
            href={`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="middle"
          >
            Go to Admin Panel
          </Button>
        </div>

        <div className={styles.adminFeatures}>
          <h3>Inside the Admin Panel</h3>

          <ul>
            <li>
              <strong>Blog Management:</strong> Create new blog posts directly 
              from the dashboard. Once published, posts are immediately visible 
              on the public website.
            </li>

            <li>
              <strong>Analytics Dashboard:</strong> View accurate statistics 
              including unique visitors, page activity, and overall traffic insights.
            </li>

            <li>
              <strong>Role-Based Access:</strong> Only authorized users can access 
              admin routes, enforced both on the frontend and backend.
            </li>
          </ul>

          <p>
            Authenticated admin → content creation → public visibility → 
            analytics tracking → real-time statistics display.
          </p>
        </div>
      </section>
    </div>
  );
}
