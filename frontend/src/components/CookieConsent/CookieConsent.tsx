'use client';

import { useEffect, useState } from 'react';
import styles from './CookieConsent.module.css';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) setVisible(true);
    }
  }, []);

  const acceptCookies = (): void => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite">
      <div className="container">
        <div className={styles.content}>
          <span>
            We use cookies to improve your experience on the site.{' '}
            <a href="/privacy" className={styles.link}>Learn more</a>
          </span>
          <button className={styles.button} onClick={acceptCookies}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
