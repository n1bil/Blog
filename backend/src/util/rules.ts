export const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

interface DuplicateEmailError extends Error {
    keyPattern?: Record<string, unknown>;
}

export const isDuplicateEmailError = (error: unknown): error is DuplicateEmailError => {
    return (
        error instanceof Error &&
        Object.prototype.hasOwnProperty.call(error, 'keyPattern') &&
        error.message.includes('E11000 duplicate key error collection') &&
        error.message.includes('personal_info.email')
    );
};