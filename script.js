// Mengambil elemen dari HTML
const formLogin = document.getElementById('formLogin');
const inputPassword = document.getElementById('password');
const teksPesan = document.getElementById('pesan');

// Menambahkan aksi ketika tombol submit/login ditekan
formLogin.addEventListener('submit', function(event) {
    // Mencegah halaman reload (refresh) secara otomatis
    event.preventDefault();

    // Mengambil nilai password yang diketik (tanpa mengubah huruf besar/kecil)
    const passwordYangDiketik = inputPassword.value;

    // Logika Pengecekan Password
    // HARUS PERSIS: HANIF GANTENG (Huruf besar semua + spasi)
    if (passwordYangDiketik === "HANIF GANTENG") {
        // Jika Benar
        teksPesan.style.color = "green";
        teksPesan.innerHTML = "Berhasil Login! Selamat datang, HANIF.";
        inputPassword.style.borderColor = "green";
        
        // Opsional: Kode di bawah ini untuk berpindah ke halaman lain jika berhasil
        // window.location.href = "halaman-selanjutnya.html"; 

    } else {
        // Jika Salah
        teksPesan.style.color = "red";
        teksPesan.innerHTML = "Password Salah! Silakan coba lagi.";
        inputPassword.style.borderColor = "red";
        
        // Mengosongkan kolom password setelah salah
        inputPassword.value = ""; 
        inputPassword.focus();
    }
});
