import { z } from 'zod';

const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/msword', // doc
    'text/plain', // txt
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv', // csv
];

export const fileSchema = z.object({
    name: z.string().min(1),
    size: z.number().max(10 * 1024 * 1024), // 10MB
    type: z.enum(supportedTypes as [string, ...string[]]),
});

export const uploadSchema = z.object({
    files: z.array(fileSchema).max(50),
});