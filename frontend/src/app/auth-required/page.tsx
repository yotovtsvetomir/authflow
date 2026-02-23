import "./auth-required.css";
import { Button } from "@/ui-components/Button/Button";

interface AuthRequiredPageProps {
  searchParams: Promise<{
    from?: string;
  }>;
}

function formatRoute(path: string): string {
  if (!path || path === "/") return "Home";

  const cleanPath = path.split("?")[0];
  const segments = cleanPath.split("/").filter(Boolean);

  if (segments.length === 0) return "Home";

  const main = segments[0];

  return main
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function AuthRequiredPage({
  searchParams,
}: AuthRequiredPageProps) {
  const sp = await searchParams;
  const from = sp?.from || "/";
  const formattedRoute = formatRoute(from);

  return (
    <div className="container fullHeight centerWrapper">
      <div className="card">
        <h1>Authentication Required</h1>

        <p className="description">
          Only logged in users can view posts.
        </p>

        <p className="description">
          Permission denied for viewing {" "}
          <strong>{formattedRoute}</strong>.
        </p>

        <div className="actions">
          <Button
            href={`/login?from=${encodeURIComponent(from)}`}
            variant="primary"
            size="default"
          >
            Login
          </Button>

          <Button
            href={`/register?from=${encodeURIComponent(from)}`}
            variant="secondary"
            size="default"
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
