import { apiCache, buildCacheKey } from './cache';

const MAX_DAILY_REQUESTS = parseInt(process.env.REACT_APP_MAX_DAILY_REQUESTS || '20', 10);
const PERSIST_PREFIX = 'apiCache:';
const API_KEY = process.env.REACT_APP_API_KEY;


function todayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getUsage() {
    try {
        const key = `apiUsage:${todayKey()}`;
        const raw = localStorage.getItem(key);
        const count = raw ? parseInt(raw, 10) : 0;
        return { key, count };
    } catch {
        return { key: null, count: 0 };
    }
}

function incrementUsage() {
    const { key, count } = getUsage();
    if (!key) return;
    try {
        localStorage.setItem(key, String(count + 1));
    } catch {
        // ignore storage errors
    }
}

function readPersisted(key, acceptStale = false) {
    try {
        const raw = localStorage.getItem(PERSIST_PREFIX + key);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw);
        if (acceptStale) return parsed.data;
        if (parsed && typeof parsed.expiresAt === 'number' && parsed.expiresAt > Date.now()) {
            return parsed.data;
        }
        return undefined;
    } catch {
        return undefined;
    }
}

function writePersisted(key, data, ttlMs) {
    try {
        const record = { data, expiresAt: Date.now() + ttlMs };
        localStorage.setItem(PERSIST_PREFIX + key, JSON.stringify(record));
    } catch {
        // ignore storage errors
    }
}

async function cachedJsonGet(url, options = {}) {
    const {
        ttlMs = 1000 * 60 * 30, // 30 minutes in-memory
        persist = true,
        persistTtlMs = 1000 * 60 * 60 * 12, // 12 hours persistent
        bypassCache = false,
        bypassQuota = false,
    } = options;

    const key = buildCacheKey(url);

    if (!bypassCache) {
        const persisted = readPersisted(key, false);
        if (persisted !== undefined) {
            return persisted;
        }
        const memo = apiCache.get(key);
        if (memo !== undefined) {
            return memo;
        }
    }

    return apiCache.dedupe(
        key,
        async () => {
            if (!bypassQuota) {
                const { count } = getUsage();
                if (count >= MAX_DAILY_REQUESTS) {
                    const stale = readPersisted(key, true);
                    if (stale !== undefined) {
                        return stale;
                    }
                    throw new Error('Daily API quota reached. Please try again tomorrow.');
                }
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            if (persist) {
                writePersisted(key, json, persistTtlMs);
            }
            incrementUsage();
            return json;
        },
        ttlMs
    );
}

//Used to call on recipes based on their cuisine
export async function fetchRecipes(options = {}) {
    const { query, cuisine, number = 6, offset = 0, sort, bypassCache, ttlMs } = options; 

    let url = `/recipes/complexSearch?apiKey=${API_KEY}`;

    if (number) {
        url += `&number=${number}`;
    }
    if (offset) {
        url += `&offset=${offset}`;
    }
    if (cuisine) {
        url += `&cuisine=${encodeURIComponent(cuisine)}`; 
    }
    if (query) {
        url += `&query=${encodeURIComponent(query)}`;   
    }
    if (sort) {
        url += `&sort=${encodeURIComponent(sort)}`;
    }

    return cachedJsonGet(url, { ttlMs: ttlMs ?? 1000 * 60 * 30, persistTtlMs: 1000 * 60 * 60 * 12, bypassCache: !!bypassCache });
}

/* Used to look up ingredients 
/* @ingredients a string that must have a , to seperate the items 
/* @number default 10 recipes will appear 
/* @ranking 1 will priotize the ingredients that we have the most of 
/* @ignorePantry true will ignore common ingredients like salt, pepper, etc...
*/
export async function findRecipesByIngredients(options = {}){
    const { ingredients, number = 6, ranking = 1, ignorePantry = true, bypassCache, ttlMs } = options;
    let url = `/recipes/findByIngredients?apiKey=${API_KEY}`;

    const ingredientsString = Array.isArray(ingredients)
        ? ingredients.join(',')
        : ingredients;

    if (ingredientsString){
        url += `&ingredients=${encodeURIComponent(ingredientsString)}`;
    }

    if (number){
        url += `&number=${number}`;
    }

    if (ranking){
        url += `&ranking=${ranking}`;
    }

    if (ignorePantry !== undefined) {
        url += `&ignorePantry=${ignorePantry}`;
    }

    return cachedJsonGet(url, { ttlMs: ttlMs ?? 1000 * 60 * 60 * 6, persistTtlMs: 1000 * 60 * 60 * 12, bypassCache: !!bypassCache });
}

//Used to show the recipe information when user clicks "view recipe"
export async function getRecipeDetails(recipeId, options = {}) {
    const { bypassCache, ttlMs } = options;
    const url = `/recipes/${recipeId}/information?apiKey=${API_KEY}`;

    return cachedJsonGet(url, { ttlMs: ttlMs ?? 1000 * 60 * 60 * 24, persistTtlMs: 1000 * 60 * 60 * 24, bypassCache: !!bypassCache });
}
