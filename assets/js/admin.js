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

// Fungsi untuk tambah buku
async function addBook(title, author, description, coverFile) {
    try {
        let coverURL = null;
        if (coverFile) {
            const storageRef = firebase.storage().ref();
            const coverRef = storageRef.child(`covers/${Date.now()}`);
            await coverRef.put(coverFile);
            coverURL = await coverRef.getDownloadURL();
        }

        await firebase.firestore().collection('books').add({
            title: title,
            author: author,
            description: description,
            coverURL: coverURL,
            available: true
        });
        alert('Buku berhasil ditambah!');
        loadAdminBooks();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Fungsi untuk edit buku (simplified)
async function editBook(id) {
    // Implementasi edit form (bisa tambah modal)
    alert('Fitur edit belum diimplementasi lengkap.');
}

// Fungsi untuk hapus buku
async function deleteBook(id) {
    if (confirm('Hapus buku ini?')) {
        await firebase.firestore().collection('books').doc(id).delete();
        loadAdminBooks();
    }
}

// Fungsi untuk load daftar peminjaman admin
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

// Fungsi untuk approve peminjaman
async function approveBorrow(id) {
    await firebase.firestore().collection('borrow_records').doc(id).update({ status: 'approved' });
    loadAdminBorrows();
}

// Fungsi untuk reject peminjaman
async function rejectBorrow(id) {
    await firebase.firestore().collection('borrow_records').doc(id).update({ status: 'rejected' });
    loadAdminBorrows();
}

// Fungsi untuk return buku
async function returnBook(id) {
    await firebase.firestore().collection('borrow_records').doc(id).update({
        status: 'returned',
        returnDate: firebase.firestore.Timestamp.now()
    });
    loadAdminBorrows();
}

// Fungsi untuk toggle sidebar (responsif)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

// Fungsi untuk show add book form (simplified)
function showAddBookForm() {
    // Implementasi form tambah buku (bisa tambah modal)
    alert('Fitur tambah buku belum diimplementasi lengkap.');
}
