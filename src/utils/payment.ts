export function generatePaymentId(): string {
    const timestamp = Date.now();
    let random: string;

    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        random = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    } else {
        random = Math.random().toString(36).substring(2, 10);
    }

    return `pmt_${timestamp}_${random}`;
}