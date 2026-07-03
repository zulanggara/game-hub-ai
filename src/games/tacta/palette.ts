export interface PlayerColor {
  key: string;
  label: string;
  a: string;
  b: string;
}

export const PLAYER_COLORS: PlayerColor[] = [
  { key: "ember", label: "Bara", a: "#f0a15c", b: "#c9542c" },
  { key: "frost", label: "Beku", a: "#9fc4ea", b: "#5f8fc4" },
  { key: "moss", label: "Lumut", a: "#a9d18f", b: "#5c8a52" },
  { key: "wine", label: "Anggur", a: "#c97a7a", b: "#9a3b3b" },
  { key: "storm", label: "Badai", a: "#a79bd1", b: "#6b5b95" },
  { key: "gold", label: "Emas", a: "#f2d67e", b: "#c9a227" },
];

export function colorFor(key: string): PlayerColor {
  return PLAYER_COLORS.find((c) => c.key === key) ?? PLAYER_COLORS[0];
}
