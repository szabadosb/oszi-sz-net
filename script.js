const counterEl = document.getElementById('counter').querySelector('span');
const detailedEl = document.getElementById('detailed-countdown');
let confettiInterval = null;
let confettiCleanupTimeout = null;

const MAX_ACTIVE_CONFETTI = 120;
const CONFETTI_ANIMATION_DURATION = 4000;
const CONFETTI_REGEN_RATE = 100;

let confettiPool = [];
let activeConfettiCount = 0;

function getTargetDate() {
    const now = new Date();
    // 2025. október 23.
    let target = new Date(now.getFullYear(), 9, 23); // Month is 0-indexed (October is 9)

    // If today is past the target date for this year, set it for next year
    if (now > target) {
        target = new Date(now.getFullYear() + 1, 9, 23);
    }
    return target;
}

// Format numbers: currently return plain string without thousands separators
function formatNumber(n) {
    return String(n);
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
    // Autumn colors
    const colors = ["#FF4500", "#FF8C00", "#DAA520", "#8B4513", "#A0522D", "#B22222"];
    return colors[Math.floor(Math.random() * colors.length)];
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

    // Define the break period (October 23 to November 2 for Autumn)
    const breakStart = new Date(now.getFullYear(), 9, 23); // October 23
    const breakEnd = new Date(now.getFullYear(), 10, 3); // November 3 (exclusive)

    const isBreak = (now >= breakStart && now < breakEnd);

    if (isBreak) {
        counterEl.classList.remove('fade-out');
        counterEl.textContent = "Őszi szünet van!";
        detailedEl.textContent = "Élvezd a vakációt! 🎉";

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
        counterEl.innerHTML = `<span class="number">${formatNumber(diffInSeconds)}</span> másodperc van hátra az őszi szünetig!`;
        counterEl.classList.remove('fade-out');
    }, 250);

    detailedEl.innerHTML = `Ez pontosan <span class="number">${formatNumber(Math.floor(diffInSeconds / (3600 * 24)))}</span> nap, <span class="number">${formatNumber(Math.floor((diffInSeconds % (3600 * 24)) / 3600))}</span> óra, <span class="number">${formatNumber(Math.floor((diffInSeconds % 3600) / 60))}</span> perc, <span class="number">${formatNumber(diffInSeconds % 60)}</span> másodperc.`;
}

function updateDetailedBox(target) {
    const now = new Date();
    let timeLeft = target - now;

    if (timeLeft < 0) {
        // If the target date has passed, calculate for next year's break
        target = new Date(target.getFullYear() + 1, 9, 23); // October 23
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

function updateAll() {
    const target = getTargetDate();
    updateMainCounter(target);
    updateDetailedBox(target);
}

// First run and update every second
updateAll();
setInterval(updateAll, 1000);

