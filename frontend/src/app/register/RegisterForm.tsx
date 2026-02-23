'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRegister } from '@/hooks/useRegister';
import { Input } from '@/ui-components/Input/Input';
import { Button } from '@/ui-components/Button/Button';
import { Heading } from '@/ui-components/Heading/Heading';
import { TextLink } from '@/ui-components/TextLink/TextLink';
import SideSlideshow from '@/ui-components/SideSlideshow/SideSlideshow';
import { useSearchParams } from 'next/navigation';

import styles from './RegisterForm.module.css';

import LogoLetters from '@/assets/logo_horizontal_letters.png';
import Logo from '@/assets/logo.png';
import Picnic from '@/assets/picnic.png';
import Birthday from '@/assets/birthday.png';
import Wedding from '@/assets/wedding.png';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/profile';

  const {
    values,
    confirmPassword,
    errors,
    loading,
    success,
    handleChange,
    handleConfirmChange,
    handleFocus,
    handleSubmit,
    handleGoogleRegister,
    handleFacebookRegister,
    fbReady,
  } = useRegister({ redirectTo: from });

  return (
    <div className={styles.screen}>
      <div className={styles.main}>
        <div className={`container ${styles.register}`}>
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
              <Heading
                marginBottom="1rem"
                as="h1"
                size="3xl"
                color="--color-dark-300"
                align="center"
              >
                Welcome
              </Heading>
            </div>

            <div className={styles.socialLogin}>
              <Button onClick={handleGoogleRegister} width="100%" size="middle" variant="secondary">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  width={21}
                  height={21}
                  alt="Google Logo"
                  className={styles.sociallogo}
                />
                <p>Register with Google</p>
              </Button>

              <Button
                disabled={!fbReady}
                onClick={handleFacebookRegister}
                width="100%"
                size="middle"
                variant="secondary"
              >
                <Image
                  src="https://upload.wikimedia.org/wikipedia/en/0/04/Facebook_f_logo_%282021%29.svg"
                  width={21}
                  height={21}
                  alt="Facebook Logo"
                  className={styles.sociallogo}
                />
                <p>Register with Facebook</p>
              </Button>
            </div>

            <div className={styles.divider}>
              <p>or</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                label="First Name"
                value={values.first_name}
                onChange={handleChange}
                onFocus={handleFocus('first_name')}
                error={errors.first_name}
                required
              />

              <Input
                id="last_name"
                name="last_name"
                type="text"
                label="Last Name"
                value={values.last_name}
                onChange={handleChange}
                onFocus={handleFocus('last_name')}
                error={errors.last_name}
                required
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                value={values.email}
                onChange={handleChange}
                onFocus={handleFocus('email')}
                error={errors.email}
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={values.password}
                onChange={handleChange}
                onFocus={handleFocus('password')}
                error={errors.password}
                required
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmChange}
                onFocus={handleFocus('confirmPassword')}
                error={errors.confirmPassword}
                required
              />

              <Button width="100%" type="submit" variant="primary" disabled={loading || success}>
                {loading ? 'Registering...' : 'Register'}
              </Button>

              {errors.apiError && <p className={styles.errorMessage}>{errors.apiError}</p>}
              {success && <p className={styles.successMessage}>Registration successful!</p>}

              <div className={styles.buttonSecondaryGroup}>
                <p>
                  By continuing, you agree to our{' '}
                  <TextLink href="/terms">Terms</TextLink> and{' '}
                  <TextLink href="/privacy">Privacy</TextLink>.
                </p>
                <p>
                  Already have an account? <TextLink href="/login">Login here</TextLink>.
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
