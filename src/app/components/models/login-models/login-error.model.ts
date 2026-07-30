export interface LoginError {
    timestamp: string;
    status: number;
    errorCode: string;
    message: string;
    path: string;
}