'use client';

import { useLogin } from '@/hooks/useLogin';
import { Input } from '@/ui-components/Input/Input';
import { Button } from '@/ui-components/Button/Button';
import { Heading } from '@/ui-components/Heading/Heading';
import { TextLink } from '@/ui-components/TextLink/TextLink';
import SideSlideshow from '@/ui-components/SideSlideshow/SideSlideshow';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './LoginForm.module.css';

import LogoLetters from '@/assets/logo_horizontal_letters.png';
import Logo from '@/assets/logo.png';
import Picnic from '@/assets/picnic.png';
import Birthday from '@/assets/birthday.png';
import Wedding from '@/assets/wedding.png';

export default function Login() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/profile';

  const {
    formData,
    formErrors,
    loading,
    success,
    handleChange,
    handleFocus,
    handleSubmit,
    handleGoogleLogin,
    handleFacebookLogin,
    fbReady,
  } = useLogin({ redirectTo: from });

  return (
    <div className={styles.screen}>
      <div className={styles.main}>
        <div className={`container ${styles.login}`}>
          <div className={styles.head}>
            <Link href="/">
              <Image
                src={Logo}
                width={60}
                height={50}
                alt="Logo"
                className={styles.Logo}
              />
            </Link>
          </div>

          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <Heading marginBottom="1rem" as="h1" size="3xl" color="--color-dark-300" align="center">Welcome</Heading>
            </div>

            <div className={styles.socialLogin}>
              <Button onClick={handleGoogleLogin} width="100%" size="middle" variant="secondary">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  width={21}
                  height={21}
                  alt="Google Logo"
                  className={styles.sociallogo}
                />
                <p>Sign in with Google</p>
              </Button>

              <div style={{ marginBottom: "1rem" }} />

              <Button disabled={!fbReady} width="100%" size="middle" onClick={handleFacebookLogin} variant="secondary">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/en/0/04/Facebook_f_logo_%282021%29.svg"
                  width={21}
                  height={21}
                  alt="Facebook Logo"
                  className={styles.sociallogo}
                />
                <p>Sign in with Facebook</p>
              </Button>
            </div>

            <div className={styles.divider}>
              <p>or</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                onFocus={handleFocus('email')}
                error={formErrors.email}
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                onFocus={handleFocus('password')}
                error={formErrors.password}
                required
              />

              <Button width="100%" type="submit" variant="primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </Button>

              {formErrors.apiError && (
                <p className={styles.errorMessage}>
                  {formErrors.apiError.includes('confirm your email') ? (
                    <>
                      Please check your email to confirm your account before logging in.
                      <br />
                      <br />
                      {"Don't forget to check spam folder."}
                    </>
                  ) : (
                    formErrors.apiError
                  )}
                </p>
              )}

              {success && <p className={styles.successMessage}>Login successful!</p>}

              <div className={styles.buttonSecondaryGroup}>
                <p>By continuing, you agree to our <TextLink href="/privacy" color="accent">Terms</TextLink> and <TextLink href="/privacy" color="accent">Privacy</TextLink>.</p>
                <p>
                  {"Don't have an account?"} <TextLink href="/register" color="accent">Register</TextLink>.
                </p>
                <p>
                  Forgot your password? <TextLink href="/password-reset/request/" color="accent">Click here</TextLink>.
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
      <div className={styles.side}>
        <SideSlideshow
          slides={[
            <Image
              key="random1"
              src="https://picsum.photos/480/960?random=1"
              alt="Random 1"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />,
            <Image
              key="random2"
              src="https://picsum.photos/480/960?random=2"
              alt="Random 2"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />,
            <Image
              key="random3"
              src="https://picsum.photos/480/960?random=3"
              alt="Random 3"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />,
          ]}
        />
      </div>
    </div>
  );
}
