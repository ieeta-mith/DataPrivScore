import Papa, { type ParseResult } from "papaparse";
import type { ParsedCSV } from "@/types/csv-parser";

export const parseCSV = (file: File, maxRows: number = 1000): Promise<ParsedCSV> => {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      preview: maxRows + 1,
      skipEmptyLines: true,
      transform: (value) => value.trim(),
      complete: (results: ParseResult<string[]>) => {
        if (results.data.length < 2) {
          reject(new Error("CSV file must have at least one header row and one data row."));
          return;
        }

        const data = results.data as string[][];
        const headers = data[0];
        const rows = data.slice(1);

        resolve({ headers, rows });
      },

      error: (error: Error) => {
        reject(new Error(error.message));
      }
    })
  })
}