class TokenBucket {
	private tokens: number;
	private lastRefill: number;
	private readonly capacity: number;
	private readonly refillRate: number;

	constructor(capacity: number, tokensPerMinute: number) {
		this.capacity = capacity;
		this.tokens = capacity;
		this.lastRefill = Date.now();
		this.refillRate = tokensPerMinute / 60000;
	}

	tryConsume(): boolean {
		this.refill();

		if (this.tokens >= 1) {
			this.tokens -= 1;
			return true;
		}

		return false;
	}

	private refill(): void {
		const now = Date.now();
		const timePassed = now - this.lastRefill;
		const tokensToAdd = timePassed * this.refillRate;

		this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
		this.lastRefill = now;
	}

	getRetryAfter(): number {
		this.refill();
		if (this.tokens >= 1) return 0;

		const tokensNeeded = 1 - this.tokens;
		return Math.ceil(tokensNeeded / this.refillRate);
	}
}

export const rateLimiter = new TokenBucket(25, 25);
