// ==========================================
// SISTEM ZOOM-IN SINEMATIK POLAROID
// ==========================================

const semuaPolaroid = document.querySelectorAll('.polaroid');
const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImage = document.getElementById('zoomImage');

// Event Klik pada Setiap Polaroid
semuaPolaroid.forEach(polaroid => {
    polaroid.addEventListener('click', function(e) {
        e.stopPropagation();
        const fotoSrc = this.getAttribute('data-foto');
        bukaZoom(fotoSrc);
    });
});

// Fungsi Membuka Zoom
function bukaZoom(src) {
    zoomImage.src = src;
    zoomOverlay.classList.add('aktif');
    document.body.style.overflow = 'hidden';
}

// Fungsi Menutup Zoom (Klik di area gelap)
zoomOverlay.addEventListener('click', function(e) {
    if (e.target === zoomOverlay || e.target.classList.contains('close-hint')) {
        tutupZoom();
    }
});

// Fungsi Menutup Zoom
function tutupZoom() {
    zoomOverlay.classList.remove('aktif');
    setTimeout(() => {
        zoomImage.src = '';
    }, 500);
    document.body.style.overflow = '';
}

// Tutup zoom dengan tombol ESC (Laptop)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && zoomOverlay.classList.contains('aktif')) {
        tutupZoom();
    }
});

// ==========================================
// BUG FIX: BACK BUTTON (BfCache)
// ==========================================
window.addEventListener('pageshow', function(event) {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        zoomOverlay.classList.remove('aktif');
        zoomImage.src = '';
        document.body.style.overflow = '';
    }
});
