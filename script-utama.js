document.addEventListener('DOMContentLoaded', function () {
    // 1. ELEMEN SELEKTOR
    const semuaPolaroid = document.querySelectorAll('.polaroid');
    const zoomOverlay = document.getElementById('zoomOverlay');
    const zoomImage = document.getElementById('zoomImage');

    const btnIM = document.getElementById('btnIM');
    const modalNarasi = document.getElementById('modalNarasi');
    const btnCloseNarasi = document.getElementById('btnCloseNarasi');

    // 2. SISTEM ZOOM POLAROID (AMAN UNTUK HP & LAPTOP)
    semuaPolaroid.forEach(polaroid => {
        polaroid.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Mengambil nama file gambar dari atribut data-foto
            const fotoSrc = this.getAttribute('data-foto');
            
            if (fotoSrc) {
                bukaZoom(fotoSrc);
            }
        });
    });

    function bukaZoom(src) {
        zoomImage.src = src;
        zoomOverlay.classList.add('aktif');
        document.body.style.overflow = 'hidden';
    }

    // Klik overlay zoom untuk menutup
    zoomOverlay.addEventListener('click', function (e) {
        tutupZoom();
    });

    function tutupZoom() {
        zoomOverlay.classList.remove('aktif');
        setTimeout(() => { 
            zoomImage.src = ''; 
        }, 400);
        document.body.style.overflow = '';
    }

    // 3. SISTEM MODAL NARASI K3RS (IM)
    if (btnIM) {
        btnIM.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            modalNarasi.classList.add('aktif');
            document.body.style.overflow = 'hidden';
        });
    }

    if (btnCloseNarasi) {
        btnCloseNarasi.addEventListener('click', function (e) {
            e.preventDefault();
            tutupModalNarasi();
        });
    }

    if (modalNarasi) {
        modalNarasi.addEventListener('click', function (e) {
            if (e.target === modalNarasi) {
                tutupModalNarasi();
            }
        });
    }

    function tutupModalNarasi() {
        modalNarasi.classList.remove('aktif');
        document.body.style.overflow = '';
    }

    // 4. SHORTCUT ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (zoomOverlay && zoomOverlay.classList.contains('aktif')) tutupZoom();
            if (modalNarasi && modalNarasi.classList.contains('aktif')) tutupModalNarasi();
        }
    });
});

// 5. ANTI BUG LAYAR HITAM BACK BUTTON
window.addEventListener('pageshow', function (event) {
    const zoomOverlay = document.getElementById('zoomOverlay');
    const modalNarasi = document.getElementById('modalNarasi');

    if (zoomOverlay) zoomOverlay.classList.remove('aktif');
    if (modalNarasi) modalNarasi.classList.remove('aktif');
    document.body.style.overflow = '';
});
