/**
 * Scoreboard management — Supabase-only global leaderboard.
 * Each username exists only once; highest score wins.
 */
const Scoreboard = (() => {

    const useSupabase = () => typeof window.supabaseClient !== 'undefined' && window.supabaseClient !== null;

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
            return false;
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
            return 0;
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
            return [];
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
            return 9999;
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