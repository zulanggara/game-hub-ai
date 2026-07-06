import { registerGame } from "../../lib/gameRegistry";
import { BookshelfIllustration } from "./Illustration";

registerGame({
  id: "bookshelf",
  title: "Bookshelf",
  tagline: "Tumpuk, seimbangkan, jangan sampai roboh.",
  description:
    "Game kerja sama menjaga keseimbangan. Pilih kartu rak, ketuk tepat waktu di zona keemasan untuk menumpuknya dengan mantap, dan capai 8 tingkat bersama sebelum rak buku roboh.",
  accent: "#e6b45c",
  accentSoft: "#a8763a",
  modes: ["single", "bot", "multiplayer"],
  minPlayers: 1,
  maxPlayers: 6,
  route: "/play/bookshelf",
  status: "available",
  Illustration: BookshelfIllustration,
  Play: null,
});
