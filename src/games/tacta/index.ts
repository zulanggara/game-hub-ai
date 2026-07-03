import { registerGame } from "../../lib/gameRegistry";
import { TactaIllustration } from "./Illustration";

registerGame({
  id: "tacta",
  title: "Tacta",
  tagline: "Tutup, bertahan, dan kuasai papan.",
  description:
    "Game spasial menutup bentuk. Tempatkan kartu persegi, lingkaran, atau segitiga untuk menutup milik lawan dan menyembunyikan poin mereka, atau sebar kartumu ke sudut aman. Skor tertinggi saat dek habis yang menang.",
  accent: "#2fb8a6",
  accentSoft: "#1f7a6e",
  modes: ["single", "bot", "multiplayer"],
  minPlayers: 2,
  maxPlayers: 6,
  route: "/play/tacta",
  status: "available",
  Illustration: TactaIllustration,
  Play: null,
});
