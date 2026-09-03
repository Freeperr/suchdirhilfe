/**
 * Main application controller.
 * Handles game logic, screen transitions, UI updates, and the dynamic reset chance.
 *
 * RESET CHANCE RULE:
 *   - Starts at 1%
 *   - Increases by +1% per button press
 *   - Caps at 99% (never reaches 100%)
 *   - On a reset (lose), the chance resets back to 1%
 *   - The button has a ~1 second cooldown between presses
 */
const App = (() => {

    const STORAGE_USER = 'theButtonUser_v2';
    const STORAGE_CHANCE = 'theButtonChance_v2';
    const STORAGE_PLAYTIME = 'theButtonPlaytime_v2';

    const BASE_CHANCE = 1;
    const MAX_CHANCE = 99;
    const COOLDOWN_MS = 1000;
    const PLAYTIME_SYNC_MS = 5000; // sync playtime to DB every 5s

    let lang = 'de';
    let username = '';
    let score = 0;
    let resetChance = BASE_CHANCE;       // percentage 1–99
    let playtimeSeconds = 0;
    let playtimeInterval = null;
    let isPlaying = false;
    let onCooldown = false;

    // DOM cache
    const $ = id => document.getElementById(id);

    // ---------- Screen Management ----------

    function showScreen(screenId, animate = true) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            if (s.classList.contains('active')) {
                if (animate) {
                    s.classList.add('screen-exit');
                    setTimeout(() => {
                        s.classList.remove('active', 'screen-exit');
                    }, 300);
                } else {
                    s.classList.remove('active');
                }
            }
        });

        const target = $(screenId);
        setTimeout(() => {
            target.classList.add('active', 'screen-enter');
            setTimeout(() => target.classList.remove('screen-enter'), 500);
        }, animate ? 320 : 0);
    }

    // ---------- Language ----------

    function setLang(l) {
        lang = l;
        applyTranslations();
        showScreen('userScreen');
    }

    function applyTranslations() {
        const t = T[lang];
        $('langTitle').textContent = t.langTitle;
        $('langSubtitle').textContent = t.langSubtitle;
        $('userTitle').textContent = t.userTitle;
        $('userSubtitle').textContent = t.userSubtitle;
        $('usernameInput').placeholder = t.userPlaceholder;
        $('submitUser').textContent = t.userBtn;
        $('sbTitle').textContent = t.sbTitle;
        $('stayBtn').textContent = t.stayBtn;
        $('leaveBtn').textContent = t.leaveBtn;
        $('leaveText').textContent = t.leaveText;
    }

    // ---------- Username ----------

    async function submitUsername() {
        const t = T[lang];
        const input = $('usernameInput').value.trim();
        const errEl = $('usernameError');

        const validation = UsernameFilter.validate(input);
        if (!validation.ok) {
            errEl.textContent = t[validation.msg];
            errEl.style.opacity = '1';
            return;
        }

        try {
            const taken = await Scoreboard.isTaken(input);
            if (taken) {
                errEl.textContent = t.errorExists;
                errEl.style.opacity = '1';
                return;
            }

            errEl.style.opacity = '0';
            username = input;
            localStorage.setItem(STORAGE_USER, username);
            localStorage.setItem(STORAGE_PLAYTIME, 0);

            // Initialize score if new
            if (!(await Scoreboard.exists(username))) {
                await Scoreboard.setScore(username, 0);
            }

            score = await Scoreboard.getScore(username);

            // Restore or initialize reset chance
            const savedChance = parseInt(localStorage.getItem(STORAGE_CHANCE));
            if (!isNaN(savedChance) && savedChance >= BASE_CHANCE && savedChance <= MAX_CHANCE) {
                resetChance = savedChance;
            } else {
                resetChance = BASE_CHANCE;
                localStorage.setItem(STORAGE_CHANCE, resetChance);
            }

            AudioManager.playClick();
            startGame();
        } catch (e) {
            console.error('submitUsername error:', e);
            errEl.textContent = e && e.message ? e.message : 'Error';
            errEl.style.opacity = '1';
        }
    }

    // ---------- Game ----------

    function startGame() {
        isPlaying = true;
        showScreen('gameScreen');
        updateUI();
        renderScoreboard();
        startPlaytime();
    }

    function startPlaytime() {
        playtimeSeconds = parseInt(localStorage.getItem(STORAGE_PLAYTIME)) || 0;
        if (playtimeInterval) clearInterval(playtimeInterval);
        playtimeInterval = setInterval(() => {
            playtimeSeconds++;
            localStorage.setItem(STORAGE_PLAYTIME, playtimeSeconds);
            const m = String(Math.floor(playtimeSeconds / 60)).padStart(2, '0');
            const s = String(playtimeSeconds % 60).padStart(2, '0');
            $('playtimeValue').textContent = m + ':' + s;

            // Periodically persist playtime to Supabase
            if (playtimeSeconds % 5 === 0 && username) {
                Scoreboard.setPlaytime(username, playtimeSeconds);
            }
        }, 1000);
    }

    function pressButton() {
        if (!isPlaying) return;
        if (onCooldown) return;

        // Start cooldown
        onCooldown = true;
        $('theButton').disabled = true;
        $('theButton').style.cursor = 'not-allowed';
        const overlay = $('cooldownOverlay');
        const timer = $('cooldownTimer');
        overlay.classList.add('active');
        let remaining = COOLDOWN_MS / 1000;
        timer.textContent = remaining.toFixed(1);
        const countdownInt = setInterval(() => {
            remaining -= 0.1;
            timer.textContent = remaining.toFixed(1);
        }, 100);
        setTimeout(() => {
            clearInterval(countdownInt);
            onCooldown = false;
            overlay.classList.remove('active');
            $('theButton').disabled = false;
            $('theButton').style.cursor = 'pointer';
        }, COOLDOWN_MS);

        AudioManager.playClick();
        animateButton();

        // === CORE LOGIC ===
        const random = Math.random() * 100;
        const won = random >= resetChance;  // e.g. at 1% chance: 0–0.99 = lose, 1–99 = win

        if (won) {
            score++;
            AudioManager.playWin();
            showToast(T[lang].win, 'win');
            animateScore('win');
            spawnPopup('+' + '1', 'win');
        } else {
            score = 0;
            AudioManager.playLose();
            showToast(T[lang].lose, 'lose');
            animateScore('lose');
            spawnPopup('RESET', 'lose');

            // Chance resets back to base on a reset
            resetChance = BASE_CHANCE;
            localStorage.setItem(STORAGE_CHANCE, resetChance);
        }

        Scoreboard.setScore(username, score);

        // Increase reset chance by 1%, cap at 99
        if (won && resetChance < MAX_CHANCE) {
            resetChance++;
            localStorage.setItem(STORAGE_CHANCE, resetChance);
        }

        updateUI();
        renderScoreboard();
    }

    // ---------- UI Updates ----------

    function updateUI() {
        const t = T[lang];

        $('scoreNumber').textContent = score;
        $('playtimeLabel').textContent = t.playtime;
        $('playtimeValue').textContent = $('playtimeValue').textContent || '00:00';

        // Reset chance label
        const chanceEl = $('resetChanceText');
        chanceEl.textContent = t.resetChance + ': ' + resetChance + '%';
        chanceEl.classList.remove('high', 'medium');
        if (resetChance >= 80) chanceEl.classList.add('high');
        else if (resetChance >= 65) chanceEl.classList.add('medium');

        // Danger ring
        const ring = $('dangerRing');
        ring.classList.remove('warning', 'danger', 'critical');
        if (resetChance >= 80) ring.classList.add('critical');
        else if (resetChance >= 65) ring.classList.add('danger');
        else if (resetChance >= 55) ring.classList.add('warning');
    }

    async function renderScoreboard() {
        const t = T[lang];
        const top = await Scoreboard.getTop(10);
        const list = $('scoreList');
        const myRank = await Scoreboard.getRank(username);

        if (top.length === 0) {
            list.innerHTML = '<div class="empty-state">' + t.emptySb + '</div>';
        } else {
            list.innerHTML = top.map((entry, i) => {
                const isMe = entry.username === username;
                const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
                return '<div class="score-entry' + (isMe ? ' me' : '') + '">' +
                    '<span class="rank ' + rankClass + '">' + (i + 1) + '</span>' +
                    '<span class="name">' + escapeHtml(entry.username) + '</span>' +
                    '<span class="points">' + entry.score + '</span>' +
                    '</div>';
            }).join('');
        }

        $('rankNum').textContent = '#' + myRank;
        $('usernameDisplay').textContent = username + ' (' + score + ')';
    }

    // ---------- Animations ----------

    function animateButton() {
        const btn = $('theButton');
        btn.classList.remove('pressed');
        void btn.offsetWidth;
        btn.classList.add('pressed');
    }

    function animateScore(type) {
        const el = $('scoreNumber');
        el.classList.remove('win-anim', 'lose-anim');
        void el.offsetWidth;
        el.classList.add(type === 'win' ? 'win-anim' : 'lose-anim');
    }

    function showToast(text, type) {
        const toast = $('toast');
        toast.textContent = text;
        toast.className = 'toast ' + type + ' show';
        setTimeout(() => { toast.className = 'toast'; }, 1500);
    }

    function spawnPopup(text, type) {
        const wrapper = $('buttonWrapper');
        const popup = document.createElement('div');
        popup.className = 'score-popup ' + type;
        popup.textContent = text;
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        wrapper.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }

    // ---------- Particles ----------

    function createParticles() {
        const container = $('particles');
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = 4 + Math.random() * 8;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (15 + Math.random() * 25) + 's';
            p.style.animationDelay = Math.random() * 20 + 's';
            container.appendChild(p);
        }
    }

    // ---------- Leave Handling ----------

    function onBeforeUnload(e) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }

    function initLeaveHandling() {
        window.addEventListener('beforeunload', onBeforeUnload);
        history.pushState(null, '', location.href);
        window.addEventListener('popstate', () => {
            history.pushState(null, '', location.href);
            $('leaveModal').classList.add('active');
        });
    }

    function stayOnPage() {
        $('leaveModal').classList.remove('active');
    }

    function leavePage() {
        window.removeEventListener('beforeunload', onBeforeUnload);
        window.location.href = 'about:blank';
    }

    // ---------- Utilities ----------

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Init ----------

    async function init() {
        createParticles();
        applyTranslations();
        initLeaveHandling();

        // Enter key on username input
        $('usernameInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') submitUsername();
        });

        // Button hover sound
        $('theButton').addEventListener('mouseenter', () => {
            if (resetChance >= 65) AudioManager.playDangerTick();
        });

        // Check if user already exists
        const savedUser = localStorage.getItem(STORAGE_USER);
        if (savedUser && (await Scoreboard.exists(savedUser))) {
            username = savedUser;
            score = await Scoreboard.getScore(username);
            const savedChance = parseInt(localStorage.getItem(STORAGE_CHANCE));
            resetChance = (!isNaN(savedChance) && savedChance >= BASE_CHANCE && savedChance <= MAX_CHANCE) ? savedChance : BASE_CHANCE;
            lang = 'en';
            applyTranslations();
            startGame();
        }
    }

    // Expose public methods for HTML onclick
    return {
        init,
        setLang,
        submitUsername,
        pressButton,
        stayOnPage,
        leavePage
    };

})();

// Boot
document.addEventListener('DOMContentLoaded', App.init);