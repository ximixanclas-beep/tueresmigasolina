import Link from "next/link";

const youtubeUrl =
  process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@Tueresmigasolina";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand">
          <span className="dot" aria-hidden="true" />
          Tueresmigasolina
        </Link>
        <nav className="nav" aria-label="Principal">
          <Link href="/rutas">Rutas</Link>
          <Link href="/guias" className="hide-sm">
            Guías
          </Link>
          <Link href="/nueva" className="hide-sm">
            Publicar
          </Link>
          <a
            className="cta"
            href={youtubeUrl}
            target="_blank"
            rel="noopener"
            aria-label="Canal de YouTube"
          >
            YouTube
          </a>
        </nav>
      </div>
    </header>
  );
}
