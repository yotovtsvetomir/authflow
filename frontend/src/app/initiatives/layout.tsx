import Script from "next/script";
import styles from "./initiatives.module.css";

export default function InitiativesLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Инициативи - МоятаПокана.бг",
    url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/инициативи`,
    description: "Нашите инициативи: пълноценен уебсайт на кирилица и дигитални покани в подкрепа на екологични каузи.",
    publisher: {
      "@type": "Organization",
      name: "МоятаПокана.бг",
      url: process.env.NEXT_PUBLIC_CLIENT_URL,
      logo: `${process.env.NEXT_PUBLIC_CLIENT_URL}/logo.png`,
    },
  };

  return (
    <>
      <head>
        <title>Инициативи - МоятаПокана.бг</title>
        <meta
          name="description"
          content="Нашите инициативи: пълноценен уебсайт на кирилица и дигитални покани в подкрепа на екологични каузи."
        />

        {/* Open Graph */}
        <meta property="og:title" content="Инициативи - МоятаПокана.бг" />
        <meta
          property="og:description"
          content="Уебсайт на кирилица + дигитални покани с еко кауза."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_CLIENT_URL}/инициативи`}
        />
        <meta property="og:site_name" content="МоятаПокана.бг" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Инициативи - МоятаПокана.бг" />
        <meta
          name="twitter:description"
          content="Нашите инициативи: уебсайт изцяло на кирилица и дигитални покани с еко кауза."
        />
      </head>

      <Script
        id="jsonld-initiatives"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container fullHeight centerWrapper">
        <div className={styles.container}>
          <h1 className={styles.title}>Нашите инициативи</h1>

          {/* Cyrillic support block */}
          <div className={styles.block}>
            <div className={styles.blockHeader}>
              <span className="material-symbols-outlined">language</span>
              <h2 className={styles.blockTitle}>Пълна поддръжка на кирилица</h2>
            </div>
            <p className={styles.text}>
              МоятаПокана.бг е изградена изцяло на българския език. 
              Създадохме пълна поддръжка на кирилица — от адреси до менюта и имейли — нещо ново и уникално. Стремим се да насърчаваме хората да пишат на български.
            </p>
            <p className={styles.highlight}>
              Вижте как вашите покани могат да имат адреси като: 
              <strong> моятапокана.бг/покана</strong>
            </p>
          </div>

          {/* Eco-friendly block */}
          <div className={styles.block}>
            <div className={styles.blockHeader}>
              <span className="material-symbols-outlined">eco</span>
              <h2 className={styles.blockTitle}>Дигитални покани с еко кауза</h2>
            </div>
            <p className={styles.text}>
              Нашите покани са напълно дигитални. Без хартия, без отпадъци, без изсечени дървета – 
              само красиви покани, които могат да достигнат любимите ви хора онлайн.
            </p>
            <p className={styles.highlight}>
              Нито едно дърво не е било отсечено при създаването на вашата покана.
            </p>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
