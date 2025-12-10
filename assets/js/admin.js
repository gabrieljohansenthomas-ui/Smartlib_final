// admin.js - Fungsi untuk admin: dashboard, CRUD buku, kelola peminjaman

// Fungsi untuk load dashboard admin
async function loadAdminDashboard() {
    const booksSnapshot = await firebase.firestore().collection('books').get();
    document.getElementById('totalBooks').textContent = booksSnapshot.size;

    const pendingBorrows = await firebase.firestore().collection('borrow_records').where('status', '==', 'pending').get();
    document.getElementById('pendingBorrows').textContent = pendingBorrows.size;

    // Chart.js untuk statistik
    const ctx = document.getElementById('statsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Buku', 'Peminjaman Pending'],
            datasets: [{
                label: 'Jumlah',
                data: [booksSnapshot.size, pendingBorrows.size],
                backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        }
    });
}

// Fungsi untuk load daftar buku admin
async function loadAdminBooks() {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';

    const booksSnapshot = await firebase.firestore().collection('books').get();
    booksSnapshot.forEach(doc => {
        const book = doc.data();
        const bookItem = `
            <div class="bg-white shadow-lg rounded-lg p-4 flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold">${book.title}</h3>
                    <p>Penulis: ${book.author}</p>
                </div>
                <div>
                    <button onclick="editBook('${doc.id}')" class="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                    <button onclick="deleteBook('${doc.id}')" class="bg-red-500 text-white px-3 py-1 rounded">Hapus</button>
                </div>
            </div>
        `;
        booksList.innerHTML += bookItem;
    });
}

// Fungsi edit (versi placeholder)
/* async function editBook(id) {
    alert('Fitur edit belum diimplementasi lengkap.');
} */ 

// Fungsi hapus buku
async function deleteBook(id) {
    if (confirm('Hapus buku ini?')) {
        await firebase.firestore().collection('books').doc(id).delete();
        loadAdminBooks();
    }
}

// ADMIN - KELOLA PEMINJAMAN

// ======================================================
// LOAD ADMIN BORROWS DENGAN DELETE DI KANAN
// ======================================================
async function loadAdminBorrows() {
    const borrowsList = document.getElementById('borrowsList');
    borrowsList.innerHTML = '';

    try {
        const snapshot = await firebase.firestore()
            .collection('borrow_records')
            .orderBy('borrowDate', 'desc')
            .get();

        if (snapshot.empty) {
            borrowsList.innerHTML = '<p class="text-gray-500">Belum ada peminjaman.</p>';
            return;
        }

        for (const doc of snapshot.docs) {
            const borrow = doc.data();

            // Ambil user
            let user = { name: "User tidak ditemukan" };
            if (borrow.userId) {
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(borrow.userId)
                    .get();
                if (userDoc.exists) user = userDoc.data();
            }

            // Ambil buku
            let book = { title: "Buku tidak ditemukan" };
            if (borrow.bookId) {
                const bookDoc = await firebase.firestore()
                    .collection('books')
                    .doc(borrow.bookId)
                    .get();
                if (bookDoc.exists) book = bookDoc.data();
            }

            // Tanggal
            const borrowDate = borrow.borrowDate?.toDate().toLocaleDateString() || "-";
            const returnDate = borrow.returnDate
                ? borrow.returnDate.toDate().toLocaleDateString()
                : null;

            // Warna status
            let statusColor = "text-gray-700";
            switch (borrow.status) {
                case "pending": statusColor = "text-yellow-600"; break;
                case "approved": statusColor = "text-green-600"; break;
                case "rejected": statusColor = "text-red-600"; break;
                case "returned": statusColor = "text-blue-600"; break;
            }

            // Render item
            const item = document.createElement("div");
            item.className = "bg-white shadow-lg rounded-xl p-5 border border-gray-200";

            item.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <p><span class="font-semibold">User:</span> ${user.name}</p>
                        <p><span class="font-semibold">Buku:</span> ${book.title}</p>
                        <p class="${statusColor}"><span class="font-semibold">Status:</span> ${borrow.status}</p>
                        <p><span class="font-semibold">Tgl Pinjam:</span> ${borrowDate}</p>
                        ${returnDate ? `<p><span class="font-semibold">Tgl Kembali:</span> ${returnDate}</p>` : ""}
                        <div class="mt-3 space-x-2">
                            ${borrow.status === "pending"
                                ? `<button onclick="approveBorrow('${doc.id}', '${borrow.bookId}')"
                                     class="bg-green-600 text-white px-3 py-1 rounded-lg">Approve</button>
                                   <button onclick="rejectBorrow('${doc.id}')"
                                     class="bg-red-600 text-white px-3 py-1 rounded-lg">Reject</button>`
                                : ""
                            }
                            ${borrow.status === "approved"
                                ? `<button onclick="returnBook('${doc.id}', '${borrow.bookId}')"
                                     class="bg-blue-600 text-white px-3 py-1 rounded-lg">Kembalikan</button>`
                                : ""
                            }
                        </div>
                    </div>
                    <div>
                        <button onclick="deleteBorrow('${doc.id}')"
                            class="bg-gray-600 text-white px-3 py-1 rounded-lg">Hapus</button>
                    </div>
                </div>
            `;

            borrowsList.appendChild(item);
        }

    } catch (error) {
        console.error("Error load admin borrows:", error);
        borrowsList.innerHTML = '<p class="text-red-600">Gagal memuat peminjaman.</p>';
    }
}



// ======================================================
// APPROVE PEMINJAMAN
// ======================================================
async function approveBorrow(borrowId, bookId) {
    try {
        if (!borrowId || !bookId) return;

        await firebase.firestore().collection('borrow_records').doc(borrowId).update({
            status: 'approved'
        });

        await firebase.firestore().collection('books').doc(bookId).update({
            available: false
        });

        loadAdminBorrows();
    } catch (error) {
        console.error("Gagal approve:", error);
        alert("Gagal approve peminjaman.");
    }
}


// ======================================================
// REJECT PEMINJAMAN
// ======================================================
async function rejectBorrow(borrowId) {
    try {
        if (!borrowId) return;

        await firebase.firestore().collection('borrow_records').doc(borrowId).update({
            status: 'rejected'
        });

        loadAdminBorrows();
    } catch (error) {
        console.error("Gagal reject:", error);
        alert("Gagal menolak peminjaman.");
    }
}


// ======================================================
// RETURN BOOK
// ======================================================
async function returnBook(borrowId, bookId) {
    try {
        if (!borrowId || !bookId) return;

        await firebase.firestore().collection('borrow_records').doc(borrowId).update({
            status: 'returned',
            returnDate: firebase.firestore.Timestamp.now()
        });

        await firebase.firestore().collection('books').doc(bookId).update({
            available: true
        });

        loadAdminBorrows();
    } catch (error) {
        console.error("Gagal mengembalikan buku:", error);
        alert("Gagal mengembalikan buku.");
    }
}

// ======================================================
// DELETE PEMINJAMAN
// ======================================================
async function deleteBorrow(borrowId) {
    if (!borrowId) return;
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus peminjaman ini?");
    if (!confirmDelete) return;

    try {
        await firebase.firestore().collection('borrow_records').doc(borrowId).delete();
        alert("Peminjaman berhasil dihapus.");
        loadAdminBorrows();
    } catch (error) {
        console.error("Gagal menghapus peminjaman:", error);
        alert("Gagal menghapus peminjaman. " + error.message);
    }
}



// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

// Placeholder tampilan form
function showAddBookForm() {
    document.getElementById('addBookModal').classList.remove('hidden');
}

function closeAddBookModal() {
    document.getElementById('addBookModal').classList.add('hidden');
    const form = document.getElementById('addBookForm');
    if (form) form.reset();
}

// Load member
async function loadMembers() {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '';

    const membersSnapshot = await firebase.firestore().collection('users').where('role', '==', 'member').get();
    membersSnapshot.forEach(doc => {
        const member = doc.data();
        const memberItem = `
            <div class="bg-white shadow-lg rounded-lg p-4 flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold">${member.name}</h3>
                    <p>Email: ${member.email}</p>
                    <p>Role: ${member.role}</p>
                </div>
                <div>
                    <button onclick="viewMemberDetails('${doc.id}')" class="bg-blue-500 text-white px-3 py-1 rounded">Lihat Detail</button>
                </div>
            </div>
        `;
        membersList.innerHTML += memberItem;
    });
}

function viewMemberDetails(id) {
    alert('Fitur detail member belum diimplementasi lengkap. ID: ' + id);
}

// KUMPULAN FUNGSI ADD BOOK VERSI LAMA (dipertahankan)
async function addBookModal(event) {
    event.preventDefault();
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const description = document.getElementById('bookDescription').value;
    const coverFile = document.getElementById('bookCover')?.files?.[0];

    try {
        let coverURL = null;
        if (coverFile) {
            const storageRef = firebase.storage().ref();
            const coverRef = storageRef.child(`covers/${Date.now()}_${coverFile.name}`);
            await coverRef.put(coverFile);
            coverURL = await coverRef.getDownloadURL();
        }

        await firebase.firestore().collection('books').add({
            title: title,
            author: author,
            description: description,
            coverURL: coverURL || 'https://via.placeholder.com/150',
            available: true
        });

        alert('Buku berhasil ditambahkan!');
        closeAddBookModal();
        loadAdminBooks();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Listener lama (dipertahankan)
document.getElementById('addBookForm')?.addEventListener('submit', submitAddBook);

// FUNGSI FINAL: addBookToFirebase (versi aktif)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addBookForm');
    if (form) {
        form.addEventListener('submit', addBookToFirebase);
    }
});

// Tambah buku ke Firestore
async function addBookToFirebase(event) {
    event.preventDefault();

    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const description = document.getElementById('bookDescription').value.trim();
    const coverURL = document.getElementById('bookCoverURL').value.trim() || null;
    const bookURL = document.getElementById('bookURL')?.value.trim() || null;
    try {
        const docRef = await firebase.firestore().collection('books').add({
            title: title,
            author: author,
            description: description,
            coverURL: coverURL,
            bookURL: bookURL,
            available: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("Buku berhasil ditambah. ID:", docRef.id);
        alert("Buku berhasil ditambah.");

        document.getElementById('addBookForm').reset();
        closeAddBookModal();
        loadAdminBooks();

    } catch (error) {
        console.error("Error menambah buku:", error);
        alert("Error: " + error.message);
    }
}

// ========== EDIT BOOK FUNCTION (FINAL, SESUAI PLACEHOLDER) ==========

// Entry point seperti placeholder:
// async function editBook(id) { ... }
async function editBook(bookId) {
    try {
        const docRef = firebase.firestore().collection("books").doc(bookId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            alert("Data buku tidak ditemukan.");
            return;
        }

        const bookData = snapshot.data();

        // Simpan ID buku yang sedang diedit
        currentEditBookId = bookId;

        // Isi form di modal
        document.getElementById("editBookId").value = bookId;
        document.getElementById("editBookTitle").value = bookData.title;
        document.getElementById("editBookAuthor").value = bookData.author;
        document.getElementById("editBookDescription").value = bookData.description;
        document.getElementById("editBookCoverURL").value = bookData.coverURL || "";
        document.getElementById("editBookURL").value = bookData.bookURL || "";

        // Tampilkan modal
        document.getElementById("editBookModal").classList.remove("hidden");

    } catch (error) {
        console.error("Error membuka form edit:", error);
        alert("Terjadi kesalahan membuka data untuk diedit.");
    }
}

function closeEditBookModal() {
    document.getElementById("editBookModal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    const editForm = document.getElementById("editBookForm");
    if (editForm) {
        editForm.addEventListener("submit", saveEditedBook);
    }
});

async function saveEditedBook(event) {
    event.preventDefault();

    const newTitle = document.getElementById("editBookTitle").value.trim();
    const newAuthor = document.getElementById("editBookAuthor").value.trim();
    const newDescription = document.getElementById("editBookDescription").value.trim();
    const newCoverURL = document.getElementById("editBookCoverURL").value.trim() || null;
    const newBookURL = document.getElementById("editBookURL").value.trim() || null;
    try {
        await firebase.firestore().collection("books").doc(currentEditBookId).update({
            title: newTitle,
            author: newAuthor,
            description: newDescription,
            coverURL: newCoverURL,
            bookURL: newBookURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        closeEditBookModal();
        loadAdminBooks();

    } catch (error) {
        console.error("Error menyimpan perubahan:", error);
        alert("Gagal menyimpan perubahan.");
    }
}
