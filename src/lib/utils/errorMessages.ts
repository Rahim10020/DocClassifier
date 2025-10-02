const messages: Record<string, string> = {
    prisma_error: 'Erreur de base de données: {code}',
    validation_error: 'Données invalides',
    // More
};

export function getMessage(code: string, context: Record<string, any> = {}): string {
    let msg = messages[code] || 'Erreur inconnue';
    for (const [key, value] of Object.entries(context)) {
        msg = msg.replace(`{${key}}`, value);
    }
    return msg;
}