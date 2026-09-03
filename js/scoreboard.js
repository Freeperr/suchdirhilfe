/**
 * Scoreboard management — window.supabaseClient based.
 * Each username exists only once; highest score wins.
 * Falls back to localStorage if window.supabaseClient is not configured.
 */
const Scoreboard = (() => {

    const LOCAL_KEY = 'theButtonScores_v2';

    const useSupabase = () => typeof window.supabaseClient !== 'undefined' && window.supabaseClient !== null;

    // ---------- Local fallback ----------
    function localGetAll() {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr.map(row => ({
                username: row.username || row.name || '',
                playtime: Number(row.playtime || 0),
                score: Number(row.score || 0)
            })).filter(row => row.username) : [];
        } catch {
            return [];
        }
    }

    function localSaveAll(arr) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(arr.map(row => ({
            username: row.username || row.name || '',
            playtime: Number(row.playtime || 0),
            score: Number(row.score || 0)
        })).filter(row => row.username)));
    }

    function localSet(username, score) {
        const arr = localGetAll();
        const idx = arr.findIndex(e => e.username === username);
        if (idx >= 0) arr[idx].score = score;
        else arr.push({ username, playtime: 0, score });
        localSaveAll(arr);
    }

    // ---------- Helpers ----------
    function normalize(row) {
        return {
            username: row.username,
            playtime: row.playtime || 0,
            score: row.score || 0
        };
    }

    async function createUser(username, extra = {}) {
        const payload = { username, playtime: 0, score: 0, ...extra };
        const { error } = await window.supabaseClient
            .from(window.DB_TABLE)
            .upsert(payload, { onConflict: 'username' });
        if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) {
            console.error('createUser error:', error);
        }
    }

    // ---------- Public API ----------

    // Returns true if the username already exists in the DB
    async function isTaken(username) {
        if (!useSupabase()) {
            return localGetAll().some(e => e.username === username);
        }
        const { data, error } = await window.supabaseClient
            .from(window.DB_TABLE)
            .select('username')
            .eq('username', username)
            .limit(1);
        if (error) {
            console.error('isTaken error:', error);
            return false;
        }
        return data && data.length > 0;
    }

    async function exists(username) {
        return isTaken(username);
    }

    // Get a player's current score (0 if not found)
    async function getScore(username) {
        if (!useSupabase()) {
            const e = localGetAll().find(x => x.username === username);
            return e ? e.score : 0;
        }
        const { data, error } = await window.supabaseClient
            .from(window.DB_TABLE)
            .select('score')
            .eq('username', username)
            .limit(1);
        if (error || !data || data.length === 0) return 0;
        return data[0].score || 0;
    }

    // Update score for a user. If user doesn't exist, creates them.
    async function setScore(username, score) {
        if (!useSupabase()) {
            localSet(username, score);
            return;
        }
        const { error } = await window.supabaseClient
            .from(window.DB_TABLE)
            .upsert({ username, score }, { onConflict: 'username' });
        if (error) {
            console.error('setScore error:', error);
        }
    }

    // Update playtime (seconds) for a user.
    async function setPlaytime(username, playtime) {
        if (!useSupabase()) return;
        const { error } = await window.supabaseClient
            .from(window.DB_TABLE)
            .upsert({ username, playtime }, { onConflict: 'username' });
        if (error) {
            console.error('setPlaytime error:', error);
        }
    }

    // Top N players ordered by score, then playtime
    async function getTop(n = 10) {
        if (!useSupabase()) {
            return localGetAll()
                .sort((a, b) => b.score - a.score)
                .slice(0, n);
        }
        const { data, error } = await window.supabaseClient
            .from(window.DB_TABLE)
            .select('username, playtime, score')
            .order('score', { ascending: false })
            .order('playtime', { ascending: false })
            .limit(n);
        if (error) {
            console.error('getTop error:', error);
            return [];
        }
        return (data || []).map(normalize);
    }

    // The rank (1-based) of a user among all players
    async function getRank(username) {
        if (!useSupabase()) {
            const sorted = localGetAll().sort((a, b) => b.score - a.score);
            const idx = sorted.findIndex(e => e.username === username);
            return idx >= 0 ? idx + 1 : sorted.length + 1;
        }
        const { data, error } = await window.supabaseClient
            .from(window.DB_TABLE)
            .select('username, score')
            .order('score', { ascending: false });
        if (error || !data) return 9999;
        const idx = data.findIndex(e => e.username === username);
        return idx >= 0 ? idx + 1 : data.length + 1;
    }

    return { isTaken, exists, getScore, setScore, setPlaytime, getTop, getRank };

})();