export interface SwatchColor {
  key: string;
  label: string;
  a: string;
  b: string;
}

/** Shared 6-tone swatch used wherever games need to tell players/pieces
 * apart by color (Tacta's decks, Bookshelf's books, seat markers, ...). */
export const SWATCH_COLORS: SwatchColor[] = [
  { key: "ember", label: "Bara", a: "#f0a15c", b: "#c9542c" },
  { key: "frost", label: "Beku", a: "#9fc4ea", b: "#5f8fc4" },
  { key: "moss", label: "Lumut", a: "#a9d18f", b: "#5c8a52" },
  { key: "wine", label: "Anggur", a: "#c97a7a", b: "#9a3b3b" },
  { key: "storm", label: "Badai", a: "#a79bd1", b: "#6b5b95" },
  { key: "gold", label: "Emas", a: "#f2d67e", b: "#c9a227" },
];

export function swatchFor(key: string): SwatchColor {
  return SWATCH_COLORS.find((c) => c.key === key) ?? SWATCH_COLORS[0];
}
