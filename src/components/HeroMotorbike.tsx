import Image from "next/image";

export default function HeroMotorbike() {
  return (
    <div className="hero-art hero-photo" aria-label="Suzuki GSX-S1000GT azul con la luna llena de fondo">
      <Image
        src="/moto.jpg"
        alt="Suzuki GSX-S1000GT azul en una carretera de montaña con la luna llena de fondo"
        fill
        priority
        sizes="(max-width: 860px) 100vw, 40vw"
        style={{ objectFit: "cover" }}
      />
      <span className="hero-photo-fade" aria-hidden="true" />
    </div>
  );
}
