"use client";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Stepper.module.css";

const steps = [
  { id: 1, label: "Настройки", href: (id: string) => `/%D0%BF%D0%BE%D0%BA%D0%B0%D0%BD%D0%B8/%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%B0%D0%BD%D0%B5/${id}/%D0%BD%D0%B0%D1%81%D1%82%D1%80%D0%BE%D0%B9%D0%BA%D0%B8` },
  { id: 2, label: "Събития", href: (id: string) => `/%D0%BF%D0%BE%D0%BA%D0%B0%D0%BD%D0%B8/%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%B0%D0%BD%D0%B5/${id}/%D1%81%D1%8A%D0%B1%D0%B8%D1%82%D0%B8%D1%8F` },
  { id: 3, label: "Присъствие", href: (id: string) => `/%D0%BF%D0%BE%D0%BA%D0%B0%D0%BD%D0%B8/%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%B0%D0%BD%D0%B5/${id}/%D0%BF%D1%80%D0%B8%D1%81%D1%8A%D1%81%D1%82%D0%B2%D0%B8%D0%B5` },
];

export default function Stepper() {
  const pathname = usePathname();
  const { id } = useParams();
  const [show, setShow] = useState(true);

  // Show/hide stepper on scroll (mobile)
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) return;

      setShow(currentScroll <= lastScroll || currentScroll < 50);
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let activeIndex = steps.findIndex((step) =>
    pathname.startsWith(step.href(id as string))
  );

  const isPreview = pathname == `/%D0%BF%D0%BE%D0%BA%D0%B0%D0%BD%D0%B8/%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%B0%D0%BD%D0%B5/${id}/%D0%BF%D1%80%D0%B5%D0%B3%D0%BB%D0%B5%D0%B4`;
  if (isPreview) activeIndex = steps.length;

  return (
    <div className={`${styles.stepper} ${!show ? styles.hidden : ""}`}>
      <div className={styles.stepperInner}>
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex || isPreview;

          return (
            <div className={styles.stepWrapper} key={step.id}>
              {index < steps.length - 1 && (
                <div
                  className={`${styles.connectorLine} ${index < activeIndex ? styles.filled : ""}`}
                />
              )}
              <div className={styles.step}>
                <div
                  className={`${styles.circle} ${
                    isCompleted ? styles.completed : isActive ? styles.active : ""
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined">check</span>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`${styles.label} ${isActive ? styles.activeLabel : ""}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
