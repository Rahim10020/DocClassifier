export const siteConfig = {
    name: 'DocClassifier',
    description: 'Automatic document classification and organization tool',
    url: 'https://docclassifier.app',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 50,
    sessionExpiry: 30 * 60 * 1000, // 30 minutes
    supportedFormats: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    supportedExtensions: ['pdf', 'docx', 'txt', 'xlsx'],
} as const;