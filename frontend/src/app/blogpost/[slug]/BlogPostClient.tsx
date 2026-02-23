'use client';

import Image from 'next/image';
import styles from './BlogPost.module.css';
import type { components } from '@/shared/types';

type BlogPostRead = components['schemas']['BlogPostOut'];

interface Props {
  post: BlogPostRead;
}

export default function BlogPostClient({ post }: Props) {
  let updatedDate = '';

  if (post.updated_at) {
    const date = new Date(post.updated_at);

    updatedDate = date
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '.');
  }

  return (
    <div className="container fullHeight centerWrapper">
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.meta}>
        {post.authored_by ? `From: ${post.authored_by}` : ''} {' / '}
        {`Posted on: ${updatedDate}`}
      </p>
      {post.image && (
        <div className={styles.imageWrapper}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            unoptimized
            style={{ objectFit: 'cover', objectPosition: 'center', borderRadius: '6px' }}
          />
        </div>
      )}
      <div className={styles.content}>
        {post.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    </div>
  );
}
