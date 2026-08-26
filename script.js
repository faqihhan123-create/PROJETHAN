const canvas = document.getElementById('canvasBalon');
const ctx = canvas.getContext('2d');
const btnHanif = document.getElementById('btnHanif');
const overlay = document.getElementById('overlay');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Agar kanvas selalu pas saat layar HP diputar / Laptop diresize
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
let arrayPartikel = []; // Array untuk debu pensil
const gambarDiLoad = [];
let sedangMembentukHati = false;
let waktuGlobal = 0;

daftarGambarBalon.forEach((src) => {
    const img = new Image();
    img.src = src;
    gambarDiLoad.push(img);
});

function getJarak(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// ==========================================
// 1. CLASS PARTIKEL DEBU PENSIL (CONCEPT 4)
// ==========================================
class PartikelDebu {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5; // Sangat kecil
        this.kecepatanY = Math.random() * 0.5 + 0.1; // Jatuh pelan ke bawah
        this.kecepatanX = (Math.random() - 0.5) * 0.3; // Melayang kiri-kanan
        this.opacity = Math.random() * 0.4; // Transparan agar estetik
    }

    update() {
        this.y += this.kecepatanY;
        this.x += this.kecepatanX;

        // Jika partikel debu jatuh melewati layar bawah, munculkan lagi di atas
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }

        this.draw();
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Warna abu-abu gelap khas grafit pensil
        ctx.fillStyle = `rgba(50, 50, 50, ${this.opacity})`; 
        ctx.fill();
    }
}

// ==========================================
// 2. CLASS BALON (FISIKA ORGANIK & HATI)
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
        ctx.globalCompositeOperation = "screen"; 
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotasi);
        ctx.drawImage(this.gambar, -this.radius, -this.radius * 1.5, this.radius * 2, this.radius * 3);
        ctx.restore();
    }

    update(balonLain) {
        this.draw();

        if (sedangMembentukHati) {
            let pulse = Math.sin(waktuGlobal * 3 + this.index * 0.2) * 8; 
            let targetX = this.baseTargetX + (this.baseTargetX - canvas.width/2) * (pulse * 0.01);
            let targetY = this.baseTargetY + (this.baseTargetY - canvas.height/2) * (pulse * 0.01);

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
                let jarak = getJarak(this.x, this.y, balonLain[i].x, balonLain[i].y);
                let minimalJarak = this.radius + balonLain[i].radius;

                if (jarak < minimalJarak) {
                    let overlap = minimalJarak - jarak;
                    let dx = this.x - balonLain[i].x;
                    let dy = this.y - balonLain[i].y;
                    
                    this.x += (dx / jarak) * (overlap / 2);
                    this.y += (dy / jarak) * (overlap / 2);
                    balonLain[i].x -= (dx / jarak) * (overlap / 2);
                    balonLain[i].y -= (dy / jarak) * (overlap / 2);

                    let tempDx = this.dx;
                    let tempDy = this.dy;
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

// INISIALISASI BALON & PARTIKEL
function init() {
    arrayBalon = [];
    arrayPartikel = [];
    
    // Membuat 14 Balon
    const jumlahTotalBalon = 14;
    for (let i = 0; i < jumlahTotalBalon; i++) {
        let radius = window.innerWidth < 600 ? 25 : 42; 
        let x = Math.random() * (canvas.width - radius * 2) + radius;
        let y = Math.random() * (canvas.height - radius * 2) + radius;
        
        let gambarDipilih = gambarDiLoad[i % gambarDiLoad.length];
        arrayBalon.push(new Balon(x, y, radius, gambarDipilih, i));
    }

    // Membuat 50 Partikel Debu Pensil
    for(let i = 0; i < 50; i++) {
        arrayPartikel.push(new PartikelDebu());
    }
}

function hitungPosisiHati() {
    const total = arrayBalon.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20; 
    const scale = Math.min(canvas.width, canvas.height) * 0.016;

    arrayBalon.forEach((balon, i) => {
        let t = (i / total) * Math.PI * 2; 
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        balon.baseTargetX = centerX + x * scale;
        balon.baseTargetY = centerY + y * scale;
    });
}

// AKSI TOMBOL HANIF
btnHanif.addEventListener('click', () => {
    sedangMembentukHati = true;
    hitungPosisiHati();

    setTimeout(() => {
        overlay.classList.add('aktif');
    }, 1800);

    setTimeout(() => {
        window.location.href = "halaman-utama.html"; 
    }, 2800);
});

// ==========================================
// 3. BUG FIX: BACK BUTTON (BfCache)
// ==========================================
// Kode ini memaksa layar hitam (overlay) hilang dan balon menyebar 
// kembali jika kamu menekan tombol "Back / Kembali" dari halaman utama.
window.addEventListener('pageshow', function(event) {
    // Jika halaman diload dari cache (kembali)
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        overlay.classList.remove('aktif');
        sedangMembentukHati = false;
        // Opsional: Kocok ulang posisi balon agar kembali berenang acak
        arrayBalon.forEach(balon => {
            balon.dx = (Math.random() - 0.5) * 2; 
            balon.dy = (Math.random() - 0.5) * 2;
        });
    }
});

// LOOP ANIMASI UTAMA
function animasi() {
    requestAnimationFrame(animasi);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    waktuGlobal += 0.02; 

    // Update Partikel Debu
    arrayPartikel.forEach(partikel => {
        partikel.update();
    });

    // Update Balon
    arrayBalon.forEach(balon => {
        balon.update(arrayBalon);
    });
}

// JALANKAN PROGRAM
setTimeout(() => {
    init();
    animasi();
}, 800);
