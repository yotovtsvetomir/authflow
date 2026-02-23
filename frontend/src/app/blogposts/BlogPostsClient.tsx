'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui-components/Button/Button';
import Pagination from '@/ui-components/Pagination/Pagination';
import ReactSelect, { Option } from '@/ui-components/Select/ReactSelect';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/ui-components/Input/Input';
import { Spinner } from '@/ui-components/Spinner/Spinner';
import styles from './BlogPosts.module.css';
import type { components } from '@/shared/types';

type BlogPostRead = components['schemas']['BlogPostOut'];

interface Props {
  posts: BlogPostRead[];
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
  authors?: string[];
  selectedAuthor?: string;
  ordering?: string;
}

export default function BlogPostsClient({
  posts,
  currentPage,
  totalPages,
  searchQuery = '',
  authors = [],
  selectedAuthor = '',
  ordering = '-created_at',
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(search, 500);

  const [author, setAuthor] = useState<Option | null>(
    selectedAuthor ? { label: selectedAuthor, value: selectedAuthor } : null
  );

  const [order, setOrder] = useState<Option | null>(
    ordering
      ? { label: ordering === '-created_at' ? 'Newest first' : 'Oldest first', value: ordering }
      : { label: 'Newest first', value: '-created_at' }
  );

  const [loading, setLoading] = useState(false); // Track loading state
  const [loadingTime, setLoadingTime] = useState<number | null>(null); // Track the time taken to load results

  const authorOptions: Option[] = authors.map(a => ({ label: a, value: a }));
  const orderOptions: Option[] = [
    { label: 'Newest first', value: '-created_at' },
    { label: 'Oldest first', value: 'created_at' },
  ];

  // Track the start time when filters are changed
  const [startTime, setStartTime] = useState<number | null>(null);

  // Update URL based on filters + pagination
  const updateURL = (page: number = 1) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (author?.value) params.set('author', author.value);
    if (order?.value) params.set('ordering', order.value);

    const newUrl = `/blogposts?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl);
    }
  };

  // Update URL whenever search, author, or ordering changes
  useEffect(() => {
    setLoading(true);
    setStartTime(Date.now()); // Record start time when filters change
    updateURL(1); // reset to page 1 on filter change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, author, order]);

  // Simulate data fetching (You can replace this with actual fetching logic)
  useEffect(() => {
    if (posts.length > 0 || debouncedSearch) {
      const endTime = Date.now();
      const timeTaken = (endTime - (startTime || endTime)) / 1000; // Time taken in seconds
      setLoading(false); // Set loading to false once the data is loaded
      setLoadingTime(timeTaken); // Store the time taken
    }
  }, [posts]);

  const handlePageChange = (page: number) => {
    updateURL(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container fullHeight centerWrapper">
      <h1 className={styles.heading}>Blog</h1>

      {/* Search + Filters */}
      <div className={styles.searchForm}>
        <Input
          id="search"
          name="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search blog posts..."
        />

        <div className={styles.selects}>
          <ReactSelect
            options={authorOptions}
            value={author}
            onChange={(option) => setOrder(option ?? null)}
            placeholder="Filter by author"
            isClearable
          />

          <ReactSelect
            options={orderOptions}
            value={order}
            onChange={(option) => setOrder(option ?? null)}
            placeholder="Sort by"
            isClearable={false}
          />
        </div>


        {/* Show the loading time */}
        <div className={styles.load}>
          {loadingTime !== null && (
            <p className={styles.loadingTime}>Loading time: {loadingTime.toFixed(3)}s</p>
          )}
        </div>
      </div>

      {/* Show the spinner while loading */}
      {loading ? (
        <Spinner size={40} color="var(--color-highlight-1)" />
      ) : (
        <>
          {/* Blog Grid */}
          {posts.length === 0 ? (
            <p className={styles.empty}>No blog posts found.</p>
          ) : (
            <div className={styles.grid}>
              {posts.map(post => (
                <div key={post.id} className={styles.card}>
                  {post.image && (
                    <div className={styles.imageWrapper}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className={styles.image}
                        unoptimized
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <h2 className={styles.title}>{post.title}</h2>
                  <p className={styles.author}>{post.authored_by ? `From: ${post.authored_by}` : ''}</p>
                  <p className={styles.date}>
                    Posted on:{' '}
                    {post.updated_at
                      ? new Date(post.updated_at)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          .replace(/\//g, '.')
                      : ''}
                  </p>
                  <p className={styles.excerpt}>{post.paragraphs[0].slice(0, 120)}...</p>
                  <div className={styles.cardActions}>
                    <Button
                      variant="primary"
                      width="100%"
                      icon="article"
                      iconPosition="left"
                      href={`/blogpost/${post.slug}`}
                    >
                      Read more
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {posts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
