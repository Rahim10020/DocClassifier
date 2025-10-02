type LogLevel = 'info' | 'warn' | 'error';

export function logger(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`;

    switch (level) {
        case 'info':
            console.info(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        case 'error':
            console.error(logMessage);
            // Optionally send to external service like Sentry
            // if (process.env.NODE_ENV === 'production') {
            //   Sentry.captureException(new Error(message), { extra: meta });
            // }
            break;
    }
}