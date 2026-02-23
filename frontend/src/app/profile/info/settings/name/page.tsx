"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/context/UserContext";

import { Input } from "@/ui-components/Input/Input";
import { Button } from "@/ui-components/Button/Button";
import styles from "../../Profile.module.css";

export default function EditNameForm() {
  const { user, setUser } = useUser();
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || submitted) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || {});
        return;
      }

      setUser(prevUser =>
        prevUser
          ? { ...prevUser, first_name: firstName, last_name: lastName }
          : null
      );

    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
      setSubmitted(false);
    }
  };

  return (
    <div className="container fullHeight">
      <div className={styles.sectionWrapper}>
        <h2>First name and Last name</h2>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="firstName"
            name="firstName"
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
            required
            size="large"
          />
          <Input
            id="lastName"
            name="lastName"
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
            required
            size="large"
          />

          <div className={styles.avatarActions}>
            <Link href="/profile/info">
              <Button variant="ghost">Back</Button>
            </Link>

            <Button
              type="submit"
              disabled={
                loading || (firstName === user?.first_name && lastName === user?.last_name)
              }
            >
              {loading ? "Uploading..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
