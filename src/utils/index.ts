
export default function createResponse(status: boolean, statusCode: number, data: any, message: string) {
    return {
        status,
        statusCode,
        data,
        message
    };
}

export const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const isMoreThanOneDayOld = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime(); // difference in milliseconds
    const oneDayMs = 24 * 60 * 60 * 1000; // one day in milliseconds

    return diffMs > oneDayMs;
}

export const isMoreThanOneMinuteOld = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime(); // difference in milliseconds
    const oneMinute = 60 * 1000; // 1 minute in ms
    return diffMs > oneMinute;
}

export function isValidCanadianPostalCode(code: string): boolean {
  if (!code) return false;

  // Remove spaces and make uppercase
  const normalized = code.toUpperCase().replace(/\s+/g, '');

  // Canadian postal code regex (no D, F, I, O, Q, U)
  const regex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/;

  return regex.test(normalized);
}