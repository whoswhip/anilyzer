interface CacheEntry<T> {
	data: T;
	expiresAt: number;
}

class Cache<T> {
	private store = new Map<string, CacheEntry<T>>();
	private ttl: number;

	constructor(ttlMs: number) {
		this.ttl = ttlMs;
	}

	set(key: string, data: T): void {
		this.store.set(key, {
			data,
			expiresAt: Date.now() + this.ttl
		});
	}

	get(key: string): T | null {
		const entry = this.store.get(key);
		
		if (!entry) {
			return null;
		}

		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return null;
		}

		return entry.data;
	}

	has(key: string): boolean {
		return this.get(key) !== null;
	}

	delete(key: string): void {
		this.store.delete(key);
	}

	clear(): void {
		this.store.clear();
	}

	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.store.entries()) {
			if (now > entry.expiresAt) {
				this.store.delete(key);
			}
		}
	}
}

export const seriesCache = new Cache<any>(24 * 60 * 60 * 1000);

setInterval(() => seriesCache.cleanup(), 60 * 60 * 1000);
