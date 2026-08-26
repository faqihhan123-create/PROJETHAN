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
const gambarDiLoad = [];
let sedangMembentukHati = false;
let waktuGlobal = 0; // Waktu untuk gelombang ombak

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

// Class Balon dengan Fisika Organik
class Balon {
    constructor(x, y, radius, gambar, index) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.gambar = gambar;
        this.index = index;
        
        // Kecepatan & Gelombang
        this.dx = (Math.random() - 0.5) * 2; 
        this.dy = (Math.random() - 0.5) * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.02; // Variasi kecepatan goyang
        this.wobbleAmp = 0.8 + Math.random() * 0.5;     // Amplitudo gelombang
        
        // Rotasi & Goyangan
        this.rotasi = (Math.random() - 0.5) * 0.5;
        this.kecepatanRotasi = (Math.random() - 0.5) * 0.02;

        // Target Formasi Hati
        this.baseTargetX = 0;
        this.baseTargetY = 0;
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = "screen"; 
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotasi);
        
        // Menggambar balon
        ctx.drawImage(this.gambar, -this.radius, -this.radius * 1.5, this.radius * 2, this.radius * 3);
        ctx.restore();
    }

    update(balonLain) {
        this.draw();

        if (sedangMembentukHati) {
            // === EFEK BERNAFAS / HEARTBEAT (AGAR TIDAK KAKU SAAT BENTUK HATI) ===
            // Formasi Hati mengembang dan menguncup secara halus
            let pulse = Math.sin(waktuGlobal * 3 + this.index * 0.2) * 8; 
            
            let targetX = this.baseTargetX + (this.baseTargetX - canvas.width/2) * (pulse * 0.01);
            let targetY = this.baseTargetY + (this.baseTargetY - canvas.height/2) * (pulse * 0.01);

            // Pergerakan halus ke target (Smooth Easing)
            this.x += (targetX - this.x) * 0.04;
            this.y += (targetY - this.y) * 0.04;
            
            // Goyangan halus saat berbentuk hati
            this.rotasi = Math.sin(waktuGlobal * 2 + this.index) * 0.15;

        } else {
            // === EFEK GERAKAN BERENANG ORGANIK (SINE WAVE) ===
            // Menambahkan gerakan meliuk halus agar tidak seperti garis lurus
            this.x += Math.sin(waktuGlobal * 2 + this.index) * this.wobbleAmp;
            this.y += Math.cos(waktuGlobal * 1.5 + this.index) * (this.wobbleAmp * 0.5);

            // Pantulan Dinding Layar
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.dx = -this.dx;
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.dy = -this.dy;

            // Pantulan antar Balon (Fisika Memantul)
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
            
            // Rotasi berayun pelan
            this.rotasi += Math.sin(waktuGlobal) * 0.005;
        }
    }
}

// Inisialisasi 14 Balon
function init() {
    arrayBalon = [];
    const jumlahTotalBalon = 14;

    for (let i = 0; i < jumlahTotalBalon; i++) {
        let radius = window.innerWidth < 600 ? 25 : 42; 
        let x = Math.random() * (canvas.width - radius * 2) + radius;
        let y = Math.random() * (canvas.height - radius * 2) + radius;
        
        let gambarDipilih = gambarDiLoad[i % gambarDiLoad.length];
        arrayBalon.push(new Balon(x, y, radius, gambarDipilih, i));
    }
}

// Rumus Formasi Hati Presisi
function hitungPosisiHati() {
    const total = arrayBalon.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20; // Ditinggikan sedikit agar pas di tengah tombol
    const scale = Math.min(canvas.width, canvas.height) * 0.016;

    arrayBalon.forEach((balon, i) => {
        let t = (i / total) * Math.PI * 2; 

        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

        balon.baseTargetX = centerX + x * scale;
        balon.baseTargetY = centerY + y * scale;
    });
}

// Aksi Tombol HANIF
btnHanif.addEventListener('click', () => {
    sedangMembentukHati = true;
    hitungPosisiHati();

    // Layar mulai meredup halus setelah balon membentuk hati
    setTimeout(() => {
        overlay.classList.add('aktif');
    }, 1800);

    // Pindah Halaman
    setTimeout(() => {
        window.location.href = "halaman-utama.html"; 
    }, 2800);
});

// Loop Animasi
function animasi() {
    requestAnimationFrame(animasi);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    waktuGlobal += 0.02; // Penambah waktu untuk gelombang animasi

    arrayBalon.forEach(balon => {
        balon.update(arrayBalon);
    });
}

// Jalankan
setTimeout(() => {
    init();
    animasi();
}, 800);
