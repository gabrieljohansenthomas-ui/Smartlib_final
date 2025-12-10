// member.js - Fungsi untuk dashboard member, profil, dll.

// Fungsi untuk load dashboard member
// member.js

async function loadMemberDashboard() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const userNameEl = document.getElementById('userName');
    const availableBooksEl = document.getElementById('availableBooks');
    const totalBooksEl = document.getElementById('totalBooks');
    const activeBorrowsEl = document.getElementById('activeBorrows');
    const borrowHistoryEl = document.getElementById('borrowHistory');

    try {
        // Tampilkan nama user
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            userNameEl.textContent = userDoc.data().name;
        } else {
            userNameEl.textContent = "Member";
        }

        // Hitung buku tersedia
        const availableSnapshot = await firebase.firestore()
            .collection('books')
            .where('available', '==', true)
            .get();
        availableBooksEl.textContent = availableSnapshot.size;

        // Hitung total buku
        const totalSnapshot = await firebase.firestore().collection('books').get();
        totalBooksEl.textContent = totalSnapshot.size;

        // Hitung peminjaman aktif (status pending/approved, belum returned)
        const activeBorrowsSnapshot = await firebase.firestore()
            .collection('borrow_records')
            .where('userId', '==', user.uid)
            .where('status', 'in', ['pending', 'approved'])
            .get();
        activeBorrowsEl.textContent = activeBorrowsSnapshot.size;

        // Hitung riwayat peminjaman (semua status)
        const borrowHistorySnapshot = await firebase.firestore()
            .collection('borrow_records')
            .where('userId', '==', user.uid)
            .get();
        borrowHistoryEl.textContent = borrowHistorySnapshot.size;

    } catch (error) {
        console.error("Gagal load dashboard:", error);
        availableBooksEl.textContent = "Error";
        totalBooksEl.textContent = "Error";
        activeBorrowsEl.textContent = "Error";
        borrowHistoryEl.textContent = "Error";
    }
}

// Pastikan auth sudah siap sebelum load dashboard
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    checkAuthAndRole('member').then(() => {
        loadMemberDashboard();
    });
});

// ======================================================
// LOAD PROFIL
// ======================================================
async function loadProfile() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists) return;

        document.getElementById('name').value = userDoc.data().name || '';

    } catch (error) {
        console.error("Gagal load profil:", error);
    }
}

// ======================================================
// UPDATE PROFIL
// ======================================================
async function updateProfile(event) {
    event.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;

    const name = document.getElementById('name').value;

    try {
        await firebase.firestore().collection('users').doc(user.uid).update({
            name: name
        });

        alert('Profil berhasil diupdate!');

    } catch (error) {
        console.error("Gagal update profil:", error);
        alert('Error update profil: ' + error.message);
    }
}

// ======================================================
// EVENT LISTENER
// ======================================================
document.getElementById('profileForm').addEventListener('submit', updateProfile);

// Panggil saat halaman siap
checkAuthAndRole('member');
loadProfile();
