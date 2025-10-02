import fs from 'fs/promises';
import XLSX from 'xlsx';

/**
 * Extracts text from an XLSX file by concatenating all cell contents.
 * @param filepath - The path to the XLSX file.
 * @returns A promise that resolves to the extracted text.
 * @throws Error if parsing fails.
 */
export async function extractTextFromXlsx(filepath: string): Promise<string> {
    try {
        const buffer = await fs.readFile(filepath);
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        let allText = '';

        workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');

            for (let row = range.s.r; row <= range.e.r; row++) {
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    const cell = sheet[cellAddress];
                    if (cell && cell.v) {
                        allText += `${cell.v} `;
                    }
                }
            }
        });

        return allText.trim();
    } catch (error) {
        console.error(`Error parsing XLSX at ${filepath}:`, error);
        throw new Error('Failed to parse XLSX file.');
    }
}