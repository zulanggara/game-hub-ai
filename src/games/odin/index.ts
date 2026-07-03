import { registerGame } from "../../lib/gameRegistry";
import { OdinIllustration } from "./Illustration";

registerGame({
  id: "odin",
  title: "Odin",
  tagline: "Buang kartu, panjat tangga, rebut Valhalla.",
  description:
    "Game shedding-card ala Viking. Kombinasikan angka dan warna untuk membentuk nilai tertinggi, rebut kartu lawan yang kau kalahkan, dan jadilah yang pertama menghabiskan kartu di tangan.",
  accent: "#d4af37",
  accentSoft: "#8a712c",
  modes: ["single", "bot", "multiplayer"],
  minPlayers: 2,
  maxPlayers: 6,
  route: "/play/odin",
  status: "available",
  Illustration: OdinIllustration,
  Play: null,
});
