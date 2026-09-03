/**
 * Multi-language username filter.
 * Checks for offensive, extremist, and inappropriate usernames.
 */
const UsernameFilter = (() => {

    const BLOCKED_WORDS = [
        // ===== German =====
        "hure","huren","fotze","fotzen","fotzl","schlampe","schlampen","wichser",
        "scheisse","scheiss","scheiße","scheisskerl","arsch","arschloch","arschgeige",
        "dummkopf","idiot","idioten","trottel","verdammt","kacke","mistkerl",
        "penis","vagina","geile","geiler","geil","nazi","nazis","hitler","goebbels",
        "himmler","heil","aryan","ss","gestapo","hakenkreuz","fckafd",
        "behindert","spasti","mongo",

        // ===== English =====
        "whore","slut","bitch","cunt","dick","cock","pussy","tits","asshole",
        "bastard","damn","shit","fag","faggot","nigger","nigga","negro",
        "retard","retarded","motherfucker","dipshit","scrotum","penis","vagina",
        "boob","boner","handjob","blowjob","dildo","porn","xxx","onlyfans",
        "suicide","kill yourself","kys","murder","terror","isis","bomb",
        "shoot","rape","rapist","pedophile","pedo","groomer","incest",

        // ===== French =====
        "pute","salope","connard","connasse","enculé","merde","branleur",
        "suceur","pédé","taré","batard",

        // ===== Spanish =====
        "puta","puto","pendejo","mierda","cabron","coño","culero",
        "estupido","imbecil","maricon","soplapollas",

        // ===== Portuguese =====
        "caralho","puta","putaria","merda","foda","desgraçado","piranha",
        "vagabunda","buceta","arrombado",

        // ===== Italian =====
        "puttana","troia","cazzo","merda","stronzo","frocio","bastardo",

        // ===== Dutch =====
        "hoer","tyfus","tering","kanker","klootzak","echt kut",
        "piemel","neuk",

        // ===== Polish =====
        "kurwa","kurwo","spierdalaj","chuju","chuj","dupa","szmata",
        "dziwka","debil",

        // ===== Russian (latinized) =====
        "suka","hui","blyad","blyat","pizda","zhopa","mudak",

        // ===== Turkish =====
        "amcik","pic","orospu","sik","gerizekali",

        // ===== Arabic (latinized) =====
        "sharmuta","kalb","himar",

        // ===== Swedish =====
        "hora","fan","javla","fitta",

        // ===== Finnish =====
        "vittu","saatana","perse","huora",

        // ===== Common gaming / internet =====
        "neo-nazi","1488","incel","loli","lolicon","shota",
        "cuck","simp","based","redpill","blackpill",

        // ===== Evasion-proof patterns =====
        "fag1","fag2","n1gga","sh1t","fck","fvck","fuk","d1ck",
        "bi7ch","wh0re","sl7ut","fuc_k","fu ck","s hit"
    ];

    const EVASION_MAP = {
        '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a',
        '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
        '$': 's', '!': 'i', '@': 'a', '€': 'e', '£': 'l',
        '¥': 'y', '+': 't', '5': 's', '7': 't', '8': 'b'
    };

    function normalize(str) {
        let s = str.toLowerCase();
        for (const [char, replacement] of Object.entries(EVASION_MAP)) {
            s = s.split(char).join(replacement);
        }
        return s.replace(/[\s\-_.!?,;:'"()+*~`^°§%&/\\=<>@#|{}[\]]/g, '');
    }

    function validate(username) {
        if (!username || username.trim().length === 0) {
            return { ok: false, msg: 'errorEmpty' };
        }

        if (username.length < 3) {
            return { ok: false, msg: 'errorShort' };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { ok: false, msg: 'errorSpecial' };
        }

        const normalized = normalize(username);

        for (const word of BLOCKED_WORDS) {
            const cleanWord = normalize(word);
            if (normalized.includes(cleanWord)) {
                return { ok: false, msg: 'errorBad' };
            }
        }

        return { ok: true };
    }

    return { validate };

})();