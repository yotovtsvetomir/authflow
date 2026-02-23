import Script from "next/script";
import BlogPostsClient from "./BlogPostsClient";
import type { components } from "@/shared/types";
import { cookies } from "next/headers";

type BlogPostsWithAuthors = components["schemas"]["BlogPostsWithAuthors"];

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogPostsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const getParam = (param?: string | string[]) =>
    Array.isArray(param) ? param[0] : param || "";

  // Extract query params
  const search = getParam(sp?.search);
  const author = getParam(sp?.author);
  const ordering = getParam(sp?.ordering) || "-created_at";
  const page = parseInt(getParam(sp?.page) || "1", 10);
  const pageSize = 10;

  // Build the query string for the API
  let queryString = "";
  if (search) queryString += `search=${encodeURIComponent(search)}&`;
  if (author) queryString += `author=${encodeURIComponent(author)}&`;
  queryString += `page=${page}&page_size=${pageSize}&ordering=${ordering}&`;
  queryString = queryString ? "?" + queryString.replace(/&$/, "") : "";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

  // Fetch the blog posts data
  const res = await fetch(`${process.env.API_URL_SERVER}/blogposts/${queryString}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  const data: BlogPostsWithAuthors = await res.json();

  if (!data?.items) {
    return <p>No blog posts found or invalid response structure.</p>;
  }

  // Structured data JSON-LD for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog",
    description: "Latest blog posts from our website",
    url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/blogposts${queryString}`,
    blogPost: data.items.map((post, index) => ({
      "@type": "BlogPosting",
      headline: post.title,
      author: post.authored_by || "Unknown",
      datePublished: post.created_at,
      dateModified: post.updated_at,
      url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/blogposts/${post.slug}`,
      image: post.image || undefined,
      description: post.paragraphs[0]?.slice(0, 120),
    }))
  };

  const title = "Blog";
  const description = "Latest blog posts from our website";
  const url = `${process.env.NEXT_PUBLIC_CLIENT_URL}/blogposts${queryString}`;
  const image = data.items[0]?.image || "/fallback.jpg";

  return (
    <>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </head>

      {/* JSON-LD structured data */}
      <Script
        id="jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Client component receives posts, pagination info, and authors */}
      <BlogPostsClient
        posts={data.items}
        currentPage={data.current_page}
        totalPages={data.total_pages}
        searchQuery={search || ""}
        authors={data.authors}
        selectedAuthor={author || ""}
        ordering={ordering}
      />
    </>
  );
}
