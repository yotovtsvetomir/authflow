"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import styles from "./ZoomableDiagram.module.css";

type Props = {
  src: StaticImageData;
  alt: string;
};

export default function ZoomableDiagram({ src, alt }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={styles.diagramWrapper}>
        <Image
          src={src}
          alt={alt}
          width={700}
          height={400}
          className={styles.diagramImage}
          style={{ cursor: "zoom-in" }}
          onClick={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className={styles.modal} onClick={() => setIsOpen(false)}>
          <Image
            src={src}
            alt={alt}
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
    </>
  );
}
