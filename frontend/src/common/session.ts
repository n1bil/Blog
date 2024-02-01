export const storeInSession = (key: string, value: string) => {
    return sessionStorage.setItem(key, value);
};

export const lookInSession = (key: string): string | null => {
    return sessionStorage.getItem(key);
};

export const removeFromSession = (key: string): void => {
    return sessionStorage.removeItem(key);
};