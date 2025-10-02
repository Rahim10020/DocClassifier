interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}

interface ErrorResponse {
    success: false;
    error: string;
    statusCode: number;
    details?: any;
}

export function successResponse<T>(data: T, message?: string): SuccessResponse<T> {
    return { success: true, data, message };
}

export function errorResponse(message: string, statusCode: number = 500, details?: any): ErrorResponse {
    return { success: false, error: message, statusCode, details };
}