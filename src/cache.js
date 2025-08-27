const defaultTtlMs = 1000 * 60 * 60 * 2; 

class TtlCache {
    constructor(ttlMs = defaultTtlMs) {
        this.ttlMs = ttlMs;
        this.map = new Map();
        this.inFlight = new Map(); 
    }

    _now() {
        return Date.now();
    }

    _isExpired(entry) {
        return !entry || entry.expiresAt <= this._now();
    }

    get(key) {
        const entry = this.map.get(key);
        if (this._isExpired(entry)) {
            this.map.delete(key);
            return undefined;
        }
        return entry.value;
    }

    set(key, value, ttlMsOverride) {
        const ttlMs = typeof ttlMsOverride === 'number' ? ttlMsOverride : this.ttlMs;
        this.map.set(key, { value, expiresAt: this._now() + ttlMs });
    }

    has(key) {
        return this.get(key) !== undefined;
    }

    clear() {
        this.map.clear();
        this.inFlight.clear();
    }

    async dedupe(key, factory, ttlMsOverride) {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached;
        }

        if (this.inFlight.has(key)) {
            return this.inFlight.get(key);
        }

        const p = Promise.resolve()
            .then(factory)
            .then((value) => {
                this.set(key, value, ttlMsOverride);
                this.inFlight.delete(key);
                return value;
            })
            .catch((err) => {
                this.inFlight.delete(key);
                throw err;
            });

        this.inFlight.set(key, p);
        return p;
    }
}

export const apiCache = new TtlCache(defaultTtlMs);

export function buildCacheKey(url, options) {
    const stable = typeof options === 'object' && options
        ? JSON.stringify(options, Object.keys(options).sort())
        : '';
    return `${url}::${stable}`;
}


