type Options = {
    uniqueTokenPerInterval?: number;
    interval?: number;
};

export default function rateLimit(options?: Options) {
    const tokenCache = new Map();
    const { uniqueTokenPerInterval = 500, interval = 60000 } = options || {};

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const tokenCount = tokenCache.get(token) || [0];
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount);
                }
                tokenCount[0] += 1;

                const currentUsage = tokenCount[0];
                const isRateLimited = currentUsage >= limit;

                // Reset the count after the interval
                // Note: This is a simplified approach. A more robust one would clear individual entries.
                // For serverless/short-lived processes, this is often "good enough" or we rely on the container restarting.
                // However, to prevent memory leaks in long-running processes, we should clean up.
                // For this simple implementation, we'll just check if it's a new entry to set a timeout to clear it?
                // Actually, a better simple approach for LRU-like behavior:

                if (isRateLimited) {
                    reject();
                } else {
                    // Clear cache after interval if it's the first hit
                    if (currentUsage === 1) {
                        setTimeout(() => {
                            tokenCache.delete(token);
                        }, interval);
                    }
                    resolve();
                }
            }),
    };
}
