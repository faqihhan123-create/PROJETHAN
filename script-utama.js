// ==========================================
// 1. SISTEM ZOOM POLAROID
// ==========================================
const semuaPolaroid = document.querySelectorAll('.polaroid');
const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImage = document.getElementById('zoomImage');

semuaPolaroid.forEach(polaroid => {
    polaroid.addEventListener('click', function(e) {
        e.stopPropagation();
        const fotoSrc = this.getAttribute('data-foto');
        bukaZoom(fotoSrc);
    });
});

function bukaZoom(src) {
    zoomImage.src = src;
    zoomOverlay.classList.add('aktif');
    document.body.style.overflow = 'hidden';
}

zoomOverlay.addEventListener('click', function(e) {
    if (e.target === zoomOverlay || e.target.classList.contains('close-hint')) {
        tutupZoom();
    }
});

function tutupZoom() {
    zoomOverlay.classList.remove('aktif');
    setTimeout(() => { zoomImage.src = ''; }, 500);
    document.body.style.overflow = '';
}

// ==========================================
// 2. SISTEM MODAL NARASI K3RS (IM)
// ==========================================
const btnIM = document.getElementById('btnIM');
const modalNarasi = document.getElementById('modalNarasi');
const btnCloseNarasi = document.getElementById('btnCloseNarasi');

// Buka Modal Narasi
btnIM.addEventListener('click', function(e) {
    e.stopPropagation();
    modalNarasi.classList.add('aktif');
    document.body.style.overflow = 'hidden';
});

// Tutup Modal via Tombol X
btnCloseNarasi.addEventListener('click', function() {
    tutupModalNarasi();
});

// Tutup Modal via Klik Luar Kertas
modalNarasi.addEventListener('click', function(e) {
    if (e.target === modalNarasi) {
        tutupModalNarasi();
    }
});

function tutupModalNarasi() {
    modalNarasi.classList.remove('aktif');
    document.body.style.overflow = '';
}

// ==========================================
// 3. KEYBOARD SHORTCUT (ESC) & BUG FIX BACK
// ==========================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (zoomOverlay.classList.contains('aktif')) tutupZoom();
        if (modalNarasi.classList.contains('aktif')) tutupModalNarasi();
    }
});

window.addEventListener('pageshow', function(event) {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        tutupZoom();
        tutupModalNarasi();
    }
});
