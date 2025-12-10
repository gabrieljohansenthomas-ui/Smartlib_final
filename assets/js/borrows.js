// borrows.js - Peminjaman & Riwayat untuk MEMBER

// ======================================================
// LOAD FORM PEMINJAMAN
// ======================================================
async function loadBorrowForm() {
    const bookSelect = document.getElementById('bookSelect');
    if (!bookSelect) return;

    bookSelect.innerHTML = '<option value="">Pilih Buku</option>';

    try {
        const booksSnapshot = await firebase.firestore()
            .collection('books')
            .where('available', '==', true)
            .get();

        booksSnapshot.forEach(doc => {
            const book = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = book.title;
            bookSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error load buku:', error);
        alert('Gagal memuat daftar buku.');
    }
}

// ======================================================
// LOAD RIWAYAT PEMINJAMAN
// ======================================================
async function loadBorrowHistory() {
    const user = firebase.auth().currentUser;
    const historyList = document.getElementById('historyList');
    if (!user || !historyList) return;

    historyList.innerHTML = '';

    try {
        const borrowsSnapshot = await firebase.firestore()
            .collection('borrow_records')
            .where('userId', '==', user.uid)
            .orderBy('borrowDate', 'desc')
            .get();

        if (borrowsSnapshot.empty) {
            historyList.innerHTML = '<p class="text-gray-500">Belum ada riwayat peminjaman.</p>';
            return;
        }

        for (const doc of borrowsSnapshot.docs) {
            const borrow = doc.data();

            // Ambil data buku
            const bookDoc = await firebase.firestore()
                .collection('books')
                .doc(borrow.bookId)
                .get();

            const book = bookDoc.exists ? bookDoc.data() : { title: 'Buku tidak ditemukan' };

            const item = document.createElement("div");
            item.className = "bg-white shadow-lg rounded-lg p-4";

            const borrowDate = borrow.borrowDate?.toDate().toLocaleDateString() || "-";
            const returnDate = borrow.returnDate ? borrow.returnDate.toDate().toLocaleDateString() : null;

            let statusColor = "text-gray-700";
            if (borrow.status === "pending") statusColor = "text-yellow-600";
            if (borrow.status === "approved") statusColor = "text-green-600";
            if (borrow.status === "rejected") statusColor = "text-red-600";
            if (borrow.status === "returned") statusColor = "text-blue-600";

            item.innerHTML = `
                <h3 class="text-lg font-semibold">${book.title}</h3>
                <p class="${statusColor}"><span class="font-semibold">Status:</span> ${borrow.status}</p>
                <p><span class="font-semibold">Tanggal Pinjam:</span> ${borrowDate}</p>
                ${returnDate ? `<p><span class="font-semibold">Tanggal Kembali:</span> ${returnDate}</p>` : ''}
            `;

            historyList.appendChild(item);
        }

    } catch (error) {
        console.error("Error load history:", error);
        alert("Gagal memuat riwayat peminjaman. " + error.message);
    }
}

// ======================================================
// EVENT LISTENER & AUTH
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        // Pastikan role member
        await checkAuthAndRole('member');

        // Load form dan riwayat
        loadBorrowForm();
        loadBorrowHistory();

        // Tambahkan listener submit
        const borrowForm = document.getElementById('borrowForm');
        if (borrowForm) {
            borrowForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const bookSelect = document.getElementById('bookSelect');
                if (!bookSelect || !bookSelect.value) {
                    alert("Pilih buku terlebih dahulu.");
                    return;
                }

                try {
                    const borrowData = {
                        userId: user.uid,                         // otomatis userId
                        bookId: bookSelect.value,
                        borrowDate: firebase.firestore.Timestamp.now(),
                        status: 'pending'
                    };

                    console.log("Mengirim peminjaman:", borrowData);
                    await firebase.firestore().collection('borrow_records').add(borrowData);

                    alert('Peminjaman diajukan!');
                    loadBorrowHistory(); // refresh riwayat
                } catch (error) {
                    console.error("Error submit peminjaman:", error);
                    alert("Gagal mengajukan peminjaman. " + error.message);
                }
            });
        }
    });
});
