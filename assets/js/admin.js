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
async function editBook(id) {
    alert('Fitur edit belum diimplementasi lengkap.');
}

// Fungsi hapus buku
async function deleteBook(id) {
    if (confirm('Hapus buku ini?')) {
        await firebase.firestore().collection('books').doc(id).delete();
        loadAdminBooks();
    }
}

// Fungsi load peminjaman
async function loadAdminBorrows() {
    const borrowsList = document.getElementById('borrowsList');
    borrowsList.innerHTML = '';

    const borrowsSnapshot = await firebase.firestore().collection('borrow_records').get();
    borrowsSnapshot.forEach(async doc => {
        const borrow = doc.data();
        const userDoc = await firebase.firestore().collection('users').doc(borrow.userId).get();
        const bookDoc = await firebase.firestore().collection('books').doc(borrow.bookId).get();
        const borrowItem = `
            <div class="bg-white shadow-lg rounded-lg p-4">
                <p>User: ${userDoc.data().name}</p>
                <p>Buku: ${bookDoc.data().title}</p>
                <p>Status: ${borrow.status}</p>
                <button onclick="approveBorrow('${doc.id}')" class="bg-green-500 text-white px-3 py-1 rounded mr-2">Approve</button>
                <button onclick="rejectBorrow('${doc.id}')" class="bg-red-500 text-white px-3 py-1 rounded mr-2">Reject</button>
                <button onclick="returnBook('${doc.id}')" class="bg-blue-500 text-white px-3 py-1 rounded">Kembalikan</button>
            </div>
        `;
        borrowsList.innerHTML += borrowItem;
    });
}

// Approve
async function approveBorrow(id) {
    await firebase.firestore().collection('borrow_records').doc(id).update({ status: 'approved' });
    loadAdminBorrows();
}

// Reject
async function rejectBorrow(id) {
    await firebase.firestore().collection('borrow_records').doc(id).update({ status: 'rejected' });
    loadAdminBorrows();
}

// Return
async function returnBook(id) {
    await firebase.firestore().collection('borrow_records').doc(id).update({
        status: 'returned',
        returnDate: firebase.firestore.Timestamp.now()
    });
    loadAdminBorrows();
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

    try {
        const docRef = await firebase.firestore().collection('books').add({
            title: title,
            author: author,
            description: description,
            coverURL: coverURL,
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

// ========== EDIT BOOK FUNCTION (FINAL) ==========
let currentEditBookId = null;

function openEditBookModal(bookId) {
    alert("Modal edit belum dibuat, tetapi fungsi pemanggilan ada.");
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

    try {
        await firebase.firestore().collection("books").doc(currentEditBookId).update({
            title: newTitle,
            author: newAuthor,
            description: newDescription,
            coverURL: newCoverURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Perubahan berhasil disimpan.");
        closeEditBookModal();
        loadAdminBooks();

    } catch (error) {
        console.error("Error menyimpan perubahan:", error);
        alert("Gagal menyimpan perubahan.");
    }
}

function closeEditBookModal() {
    alert("Modal edit belum ditutup karena modal belum dibuat.");
}
