const counterEl = document.getElementById('counter').querySelector('span');
const detailedEl = document.getElementById('detailed-countdown');
let confettiInterval = null;
let confettiCleanupTimeout = null;

// Új konstansok a teljesítmény javítására
const MAX_ACTIVE_CONFETTI = 120; // Maximum ennyi konfetti elem lesz egyszerre a DOM-ban
const CONFETTI_ANIMATION_DURATION = 4000; // A CSS animáció időtartama (4s)
const CONFETTI_REGEN_RATE = 100; // Milyen gyakran próbáljunk újraaktiválni egy konfettit (ms)

let confettiPool = []; // A konfetti elemek tárolója
let activeConfettiCount = 0; // Aktív konfetti elemek számlálója

function getTargetDate() {
    const now = new Date();
    // 2025. október 23. (Az őszi szünet kezdetének dátuma)
    let target = new Date(now.getFullYear(), 9, 23); // Month is 0-indexed (October is 9)

    // Ha ma már elmúlt október 23., akkor a következő év október 23.
    if (now > target) {
        target = new Date(now.getFullYear() + 1, 9, 23);
    }
    return target;
}

function getMonthDiff(startDate, endDate) {
    let months = 0;
    let tempDate = new Date(startDate);

    while (tempDate < endDate) {
        const currentMonthLength = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
        tempDate.setDate(tempDate.getDate() + currentMonthLength);
        months++;
    }

    return months - 1;
}

function getRandomColor() {
    // Őszi színek (narancs, barna, vörös árnyalatok)
    const colors = ["#FF4500", "#FF8C00", "#DAA520", "#8B4513", "#A0522D", "#B22222"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ÚJ segédfüggvény: két időpont közötti másodpercek, hétvégéket és szüneteket kihagyva
function getWeekdaySecondsBetween(startDate, endDate) {
    let totalMs = 0;
    let cur = new Date(startDate);
    
   /// Ünnepnapok (Példák, 2025/2026-ra szabva - A hónap 0-indexelt)
    const holidays = [
        new Date(2025, 0, 1),   // Újév napja
        new Date(2025, 3, 21),  // Húsvét hétfő (Megjegyzés: a JS1-ben 3/14 van, de az 2025-ben pontatlan volt)
        new Date(2025, 4, 1),   // Munka ünnepe
        new Date(2025, 5, 9),   // Pünkösd hétfő (Megjegyzés: a JS1-ben 5/20 van, de az 2025-ben pontatlan volt)
        new Date(2025, 7, 20),  // Államalapítás ünnepe
        new Date(2025, 9, 23),  // 1956-os forradalom
        new Date(2025, 10, 1),  // Mindenszentek
        new Date(2025, 11, 24), // Karácsony
        new Date(2025, 11, 25), // Karácsony (1. nap)
        new Date(2025, 11, 26), // Karácsony (2. nap)
        // 2026-os Újév a visszaszámlálóhoz
        new Date(2026, 0, 1),   // Újév napja 2026
    ];

    // Iskolai szünetek (Példák, csak a téli számít, de a teljesség igénye miatt itt van)
    const schoolBreaks = [
      { start: new Date(2026, 6, 23), end: new Date(2025, 8, 1) }, // Summer Break
        { start: new Date(2025, 10, 23), end: new Date(2025, 11,2) }, // Autumn Break
        { start: new Date(2026, 12, 20), end: new Date(2026, 0, 5) }, // Winter Break
        { start: new Date(2026, 4, 2), end: new Date(2026, 4, 13) }, // Mid-term Break
    ];

    while (cur < endDate) {
        let next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1, 0, 0, 0, 0);
        if (next > endDate) next = new Date(endDate);

        const day = cur.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Ellenőrizzük, hogy a jelenlegi nap ünnepnap-e
        const isHoliday = holidays.some(holiday => holiday.toDateString() === cur.toDateString());
        
        // Ellenőrizzük, hogy a jelenlegi nap iskolai szünetben van-e
        const isSchoolBreak = schoolBreaks.some(breakPeriod => cur >= breakPeriod.start && cur < breakPeriod.end);

        // Csak hétköznap (Hétfő-Péntek) számít, ha nem ünnep és nincs szünet
        if (day !== 0 && day !== 6 && !isHoliday && !isSchoolBreak) {
            totalMs += (next - cur); 
        }

        cur = next; 
    }

    return Math.floor(totalMs / 1000); // Visszatérünk az eltelt munkanapi másodpercekkel
}

function initConfettiPool() {
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < MAX_ACTIVE_CONFETTI; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.display = 'none';
        confettiContainer.appendChild(confetti);
        confettiPool.push(confetti);
    }
}

function activateConfetti() {
    if (activeConfettiCount >= MAX_ACTIVE_CONFETTI) {
        return;
    }

    const confetti = confettiPool.find(c => c.style.display === 'none');

    if (confetti) {
        confetti.style.display = 'block';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = getRandomColor();

        confetti.classList.remove('confetti');
        void confetti.offsetWidth; 
        confetti.classList.add('confetti');

        activeConfettiCount++;

        setTimeout(() => {
            confetti.style.display = 'none';
            activeConfettiCount--;
        }, CONFETTI_ANIMATION_DURATION);
    }
}

function startConfetti() {
    if (confettiInterval) {
        return;
    }

    if (confettiPool.length === 0) {
        initConfettiPool();
    }

    confettiInterval = setInterval(activateConfetti, CONFETTI_REGEN_RATE);
    console.log("Konfetti elindult!");
}

function stopConfetti() {
    clearInterval(confettiInterval);
    confettiInterval = null;
    clearTimeout(confettiCleanupTimeout);
    confettiCleanupTimeout = null;

    confettiPool.forEach(confetti => {
        confetti.style.display = 'none';
    });
    activeConfettiCount = 0;

    document.querySelector('.confetti-container')?.remove();
    confettiPool = [];
    console.log("Konfetti leállítva!");
}

function updateMainCounter(target) {
    const now = new Date();
    const diffInSeconds = Math.floor((target - now) / 1000);

    // Őszi szünet időtartama: Október 23. → November 3. (következő év)
    const breakStart = new Date(now.getFullYear(), 9, 23); // October 23
    let breakEnd = new Date(now.getFullYear(), 10, 3); // November 3 (exclusive)
    
    // Ha a szünet már elmúlt az aktuális évben, akkor a következő évre kell beállítani
    if (now > breakEnd) {
        breakStart.setFullYear(now.getFullYear() + 1);
        breakEnd.setFullYear(now.getFullYear() + 1);
    }

    const isBreak = (now >= breakStart && now < breakEnd);

    if (isBreak) {
        counterEl.classList.remove('fade-out');
        counterEl.textContent = "Őszi szünet van!"; // FELIRAT VÁLTOZÁS
        detailedEl.textContent = "Élvezd a vakációt! 🍁"; // EMOJI VÁLTOZÁS

        if (!confettiInterval) {
            startConfetti();
        }
        return;
    } else {
        if (confettiInterval) {
            stopConfetti();
        }
    }

    counterEl.classList.add('fade-out');
    setTimeout(() => {
        counterEl.innerHTML = `<span class="number">${formatNumber(diffInSeconds)}</span> másodperc van hátra az őszi szünetig!`; // FELIRAT VÁLTOZÁS
        counterEl.classList.remove('fade-out');
    }, 250);

    // Normál (teljes idő szerint)
    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    // Tanítási napok szerint (hétvégéket, ünnepeket, szüneteket kihagyva)
    const teachingSeconds = getWeekdaySecondsBetween(now, target);
    const tDays = Math.floor(teachingSeconds / (3600 * 24));
    const tHours = Math.floor((teachingSeconds % (3600 * 24)) / 3600);
    const tMinutes = Math.floor((teachingSeconds % 3600) / 60);
    const tSeconds = teachingSeconds % 60;

    detailedEl.innerHTML = 
        `Ez pontosan <span class="number">${formatNumber(days)}</span> nap, <span class="number">${formatNumber(hours)}</span> óra, <span class="number">${formatNumber(minutes)}</span> perc, <span class="number">${formatNumber(seconds)}</span> másodperc.` +
        `<br><br>Ebből <strong> <span class="number">${formatNumber(tDays)}</span> </strong> iskolai nap.`;
}

function updateDetailedBox(target) {
    const now = new Date();
    let timeLeft = target - now;

    if (timeLeft < 0) {
        target = new Date(target.getFullYear() + 1, 9, 23); // Október 23.
        timeLeft = target - now;
    }

    const totalSeconds = Math.floor(timeLeft / 1000);
    const totalMinutes = Math.floor(timeLeft / (1000 * 60));
    const totalHours = Math.floor(timeLeft / (1000 * 60 * 60));
    const totalDays = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = getMonthDiff(now, target);

    if (document.getElementById("months")) {
        document.getElementById("months").textContent = formatNumber(totalMonths);
        document.getElementById("weeks").textContent = formatNumber(totalWeeks);
        document.getElementById("days").textContent = formatNumber(totalDays);
        document.getElementById("hours").textContent = formatNumber(totalHours);
        document.getElementById("minutes").textContent = formatNumber(totalMinutes);
        document.getElementById("seconds").textContent = formatNumber(totalSeconds);
    }
}

function getBreakEndDate() {
    const now = new Date();
    // A szünet vége (November 3. 00:00:00)
    return new Date(now.getFullYear(), 10, 3);
}

function updateRemainingBreak() {
    const now = new Date();
    let breakStart = new Date(now.getFullYear(), 9, 23); // Oct 23
    let breakEnd = new Date(now.getFullYear(), 10, 3);       // Nov 3

    // Ha a szünet már elmúlt az aktuális évben, akkor a következő évre kell beállítani
    if (now > breakEnd) {
        breakStart.setFullYear(now.getFullYear() + 1);
        breakEnd.setFullYear(now.getFullYear() + 1);
    }

    const box = document.getElementById("remaining-break-box");
    const text = document.getElementById("remaining-break-text");

    if (!box || !text) return;

    // ========= SZÜNET VAN =========
    if (now >= breakStart && now < breakEnd) {
        box.style.display = "block"; 

        const diff = breakEnd - now;
        const totalSeconds = Math.floor(diff / 1000);

        const d = Math.floor(totalSeconds / (3600 * 24));
        const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        text.innerHTML = `
            A szünetből még hátravan:<br>
            <span class="number">${formatNumber(d)}</span> nap,
            <span class="number">${formatNumber(h)}</span> óra,
            <span class="number">${formatNumber(m)}</span> perc,
            <span class="number">${formatNumber(s)}</span> mp.
        `;

    } else {
        // ========= NINCS SZÜNET =========
        box.style.display = "none";
    }
}


function updateAll() {
    const target = getTargetDate();
    updateMainCounter(target);
    updateDetailedBox(target);
    updateRemainingBreak();  // <--- ÚJ
}

// Első futtatás és frissítés másodpercenként
updateAll();
setInterval(updateAll, 1000);