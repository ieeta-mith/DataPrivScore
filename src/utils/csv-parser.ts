import type { ParsedCSV } from "@/types/csv-parser";

export const parseCSV = (text: string, maxRows: number = 100): ParsedCSV => {
  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length === 0)
    throw new Error("CSV file must have headers and at least one row of data.");

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines
    .slice(1, Math.min(maxRows + 1, lines.length))
    .map((line) => line.split(",").map((v) => v.trim().replace(/^"|"$/g, "")));

	return { headers, rows };
};
