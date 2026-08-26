// 1. PENGATURAN TOMBOL HANIF Pindah Halaman
const btnHanif = document.getElementById('btnHanif');
btnHanif.addEventListener('click', () => {
    // UBAH "halaman-utama.html" dengan nama file tujuanmu nanti
    window.location.href = "halaman-utama.html"; 
    // Jika belum ada file tujuan, ganti dengan: alert("Selamat datang HANIF!");
});

// 2. SISTEM FISIKA BALON (CANVAS)
const canvas = document.getElementById('canvasBalon');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Jika ukuran layar berubah (Rotasi HP/Resize Laptop)
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Load 7 Gambar Balon
const daftarGambarBalon = [
    'balon1.png', 'balon2.png', 'balon3.png', 
    'balon4.png', 'balon5.png', 'balon6.png', 'balon7.png'
];

let arrayBalon = [];
const gambarDiLoad = [];

// Memuat gambar ke memory
daftarGambarBalon.forEach((src) => {
    const img = new Image();
    img.src = src;
    gambarDiLoad.push(img);
});

// Jarak matematis untuk pantulan
function getJarak(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// Class Balon
class Balon {
    constructor(x, y, radius, gambar) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.gambar = gambar;
        
        // Kecepatan gerak (x = horizontal, y = vertikal) acak
        this.dx = (Math.random() - 0.5) * 3; 
        this.dy = (Math.random() - 0.5) * 3;
        
        // Rotasi
        this.rotasi = Math.random() * 360;
        this.kecepatanRotasi = (Math.random() - 0.5) * 0.05;
        this.mass = 1; // Massa untuk perhitungan tabrakan
    }

    draw() {
        ctx.save();
        // Karena background gambar balon berwarna hitam, kita pakai screen blend mode 
        // agar background hitamnya hilang transparan.
        ctx.globalCompositeOperation = "screen"; 
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotasi);
        // Gambar ditaruh ditengah koordinat
        ctx.drawImage(this.gambar, -this.radius, -this.radius * 1.5, this.radius * 2, this.radius * 3);
        ctx.restore();
    }

    update(balonLain) {
        this.draw();

        // Pantulan ke Dinding Layar
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        // Pantulan antar Balon (Anti Tembus / Anti Numpuk)
        for (let i = 0; i < balonLain.length; i++) {
            if (this === balonLain[i]) continue;

            let jarak = getJarak(this.x, this.y, balonLain[i].x, balonLain[i].y);
            let minimalJarak = this.radius + balonLain[i].radius;

            // Jika bertabrakan
            if (jarak < minimalJarak) {
                // 1. Pisahkan mereka secara paksa agar tidak tembus/nyangkut (Resolve Overlap)
                let overlap = minimalJarak - jarak;
                let dx = this.x - balonLain[i].x;
                let dy = this.y - balonLain[i].y;
                
                this.x += (dx / jarak) * (overlap / 2);
                this.y += (dy / jarak) * (overlap / 2);
                balonLain[i].x -= (dx / jarak) * (overlap / 2);
                balonLain[i].y -= (dy / jarak) * (overlap / 2);

                // 2. Tukar kecepatan (Efek Terpental / Bouncing)
                let tempDx = this.dx;
                let tempDy = this.dy;
                this.dx = balonLain[i].dx;
                this.dy = balonLain[i].dy;
                balonLain[i].dx = tempDx;
                balonLain[i].dy = tempDy;
            }
        }

        // Gerakkan balon
        this.x += this.dx;
        this.y += this.dy;
        
        // Putar balon sedikit demi sedikit
        this.rotasi += this.kecepatanRotasi;
    }
}

// Inisialisasi Balon setelah semua gambar siap
function init() {
    arrayBalon = [];
    // Membuat 7 Balon
    for (let i = 0; i < 7; i++) {
        let radius = window.innerWidth < 600 ? 30 : 50; // Ukuran responsif (HP lebih kecil)
        let x = Math.random() * (canvas.width - radius * 2) + radius;
        let y = Math.random() * (canvas.height - radius * 2) + radius;
        
        // Cek agar saat pertama kali muncul tidak saling tumpuk
        if (i !== 0) {
            for (let j = 0; j < arrayBalon.length; j++) {
                if (getJarak(x, y, arrayBalon[j].x, arrayBalon[j].y) - radius * 2 < 0) {
                    x = Math.random() * (canvas.width - radius * 2) + radius;
                    y = Math.random() * (canvas.height - radius * 2) + radius;
                    j = -1; // Ulang loop
                }
            }
        }
        
        // Pilih gambar dari array berdasarkan index
        let gambarDipilih = gambarDiLoad[i % gambarDiLoad.length];
        arrayBalon.push(new Balon(x, y, radius, gambarDipilih));
    }
}

// Loop Animasi (Berjalan terus menerus)
function animasi() {
    requestAnimationFrame(animasi);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan frame sebelumnya

    arrayBalon.forEach(balon => {
        balon.update(arrayBalon);
    });
}

// Tunggu 1 detik agar gambar terload dengan baik, lalu jalankan animasi
setTimeout(() => {
    init();
    animasi();
}, 1000);
