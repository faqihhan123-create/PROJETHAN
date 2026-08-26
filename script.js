const canvas = document.getElementById('canvasBalon');
const ctx = canvas.getContext('2d');
const btnHanif = document.getElementById('btnHanif');
const overlay = document.getElementById('overlay');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Load Gambar Balon
const daftarGambarBalon = [
    'balon1.png', 'balon2.png', 'balon3.png',
    'balon4.png', 'balon5.png', 'balon6.png', 'balon7.png'
];

let arrayBalon = [];
let arrayPartikel = [];
const gambarDiLoad = [];
let sedangMembentukHati = false;
let waktuGlobal = 0;

daftarGambarBalon.forEach((src) => {
    const img = new Image();
    img.src = src;
    gambarDiLoad.push(img);
});

function getJarak(x1, y1, x2, y2) {
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// ==========================================
// 1. PARTIKEL DEBU PENSIL (DI ATAS BG)
// ==========================================
class PartikelDebu {
    constructor() {
        this.reset(true);
    }

    reset(randomY = false) {
        this.x = Math.random() * canvas.width;
        this.y = randomY ? Math.random() * canvas.height : -5;
        this.radius = Math.random() * 1.5 + 0.4; // ukuran tetap kecil & pas
        this.kecepatanY = Math.random() * 0.55 + 0.12;
        this.kecepatanX = (Math.random() - 0.5) * 0.35;
        this.opacity = Math.random() * 0.45 + 0.25; // lebih kelihatan di atas BG
        this.phase = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.kecepatanY;
        this.x += this.kecepatanX + Math.sin(waktuGlobal + this.phase) * 0.15;

        if (this.y > canvas.height + 5) {
            this.reset(false);
        }
        if (this.x < -5) this.x = canvas.width + 5;
        if (this.x > canvas.width + 5) this.x = -5;

        this.draw();
    }

    draw() {
        // WAJIB source-over agar TIDAK tertelan mode "screen" milik balon
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Abu grafit + sedikit terang biar kontras di atas sketsa
        ctx.fillStyle = `rgba(40, 40, 40, ${this.opacity})`;
        ctx.fill();
    }
}

// ==========================================
// 2. CLASS BALON
// ==========================================
class Balon {
    constructor(x, y, radius, gambar, index) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.gambar = gambar;
        this.index = index;

        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;
        this.wobbleAmp = 0.8 + Math.random() * 0.5;

        this.rotasi = (Math.random() - 0.5) * 0.5;
        this.baseTargetX = 0;
        this.baseTargetY = 0;
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = 'screen'; // hanya untuk balon (hilangin BG hitam asset)
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotasi);
        ctx.drawImage(
            this.gambar,
            -this.radius,
            -this.radius * 1.5,
            this.radius * 2,
            this.radius * 3
        );
        ctx.restore(); // KEMBALIKAN mode gambar (penting anti-bug partikel)
    }

    update(balonLain) {
        this.draw();

        if (sedangMembentukHati) {
            const pulse = Math.sin(waktuGlobal * 3 + this.index * 0.2) * 8;
            const targetX = this.baseTargetX + (this.baseTargetX - canvas.width / 2) * (pulse * 0.01);
            const targetY = this.baseTargetY + (this.baseTargetY - canvas.height / 2) * (pulse * 0.01);

            this.x += (targetX - this.x) * 0.04;
            this.y += (targetY - this.y) * 0.04;
            this.rotasi = Math.sin(waktuGlobal * 2 + this.index) * 0.15;
        } else {
            this.x += Math.sin(waktuGlobal * 2 + this.index) * this.wobbleAmp;
            this.y += Math.cos(waktuGlobal * 1.5 + this.index) * (this.wobbleAmp * 0.5);

            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.dx = -this.dx;
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.dy = -this.dy;

            for (let i = 0; i < balonLain.length; i++) {
                if (this === balonLain[i]) continue;

                const jarak = getJarak(this.x, this.y, balonLain[i].x, balonLain[i].y);
                const minimalJarak = this.radius + balonLain[i].radius;

                if (jarak < minimalJarak && jarak > 0) {
                    const overlap = minimalJarak - jarak;
                    const dx = this.x - balonLain[i].x;
                    const dy = this.y - balonLain[i].y;

                    this.x += (dx / jarak) * (overlap / 2);
                    this.y += (dy / jarak) * (overlap / 2);
                    balonLain[i].x -= (dx / jarak) * (overlap / 2);
                    balonLain[i].y -= (dy / jarak) * (overlap / 2);

                    const tempDx = this.dx;
                    const tempDy = this.dy;
                    this.dx = balonLain[i].dx;
                    this.dy = balonLain[i].dy;
                    balonLain[i].dx = tempDx;
                    balonLain[i].dy = tempDy;
                }
            }

            this.x += this.dx;
            this.y += this.dy;
            this.rotasi += Math.sin(waktuGlobal) * 0.005;
        }
    }
}

// ==========================================
// 3. INIT
// ==========================================
function init() {
    arrayBalon = [];
    arrayPartikel = [];

    // 14 Balon (7 warna x 2)
    const jumlahTotalBalon = 14;
    for (let i = 0; i < jumlahTotalBalon; i++) {
        const radius = window.innerWidth < 600 ? 25 : 42;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        const gambarDipilih = gambarDiLoad[i % gambarDiLoad.length];
        arrayBalon.push(new Balon(x, y, radius, gambarDipilih, i));
    }

    // PARTIKEL DITAMBAH biar rame (150)
    const jumlahPartikel = window.innerWidth < 600 ? 110 : 150;
    for (let i = 0; i < jumlahPartikel; i++) {
        arrayPartikel.push(new PartikelDebu());
    }
}

function hitungPosisiHati() {
    const total = arrayBalon.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;
    const scale = Math.min(canvas.width, canvas.height) * 0.016;

    arrayBalon.forEach((balon, i) => {
        const t = (i / total) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        balon.baseTargetX = centerX + x * scale;
        balon.baseTargetY = centerY + y * scale;
    });
}

// Tombol HANIF
btnHanif.addEventListener('click', () => {
    sedangMembentukHati = true;
    hitungPosisiHati();

    setTimeout(() => {
        overlay.classList.add('aktif');
    }, 1800);

    setTimeout(() => {
        window.location.href = 'halaman-utama.html';
    }, 2800);
});

// Fix bug layar hitam saat tombol BACK
window.addEventListener('pageshow', function (event) {
    if (event.persisted || performance.getEntriesByType('navigation')[0].type === 'back_forward') {
        overlay.classList.remove('aktif');
        sedangMembentukHati = false;
        arrayBalon.forEach((balon) => {
            balon.dx = (Math.random() - 0.5) * 2;
            balon.dy = (Math.random() - 0.5) * 2;
        });
    }
});

// ==========================================
// 4. LOOP ANIMASI
// ==========================================
function animasi() {
    requestAnimationFrame(animasi);

    // Reset total mode gambar tiap frame (ANTI BUG partikel hilang)
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    waktuGlobal += 0.02;

    // 1) Balon dulu
    arrayBalon.forEach((balon) => {
        balon.update(arrayBalon);
    });

    // 2) Partikel di ATAS background & di atas layer balon
    //    (supaya tidak tertutup BG dan tetap kelihatan)
    ctx.globalCompositeOperation = 'source-over';
    arrayPartikel.forEach((partikel) => {
        partikel.update();
    });
}

setTimeout(() => {
    init();
    animasi();
}, 800);
