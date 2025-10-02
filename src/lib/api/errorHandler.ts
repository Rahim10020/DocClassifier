import { ZodError } from 'zod';
import { errorResponse } from './apiResponse';
import { getMessage } from '@/lib/utils/errorMessages';

export function handleApiError(error: unknown) {
    if (error instanceof ZodError) {
        return errorResponse('Validation error', 400, error.errors);
    } else if (isPrismaError(error)) {
        return errorResponse(getMessage('prisma_error', { code: (error as any).code }), 500);
    } else if (error instanceof Error) {
        return errorResponse(error.message, 500);
    } else {
        return errorResponse('Unknown error', 500);
    }
}

function isPrismaError(error: unknown): boolean {
    return !!error && typeof error === 'object' && 'code' in error && typeof (error as any).code === 'string';
}

function isZodError(error: unknown): error is ZodError {
    return error instanceof ZodError;
}