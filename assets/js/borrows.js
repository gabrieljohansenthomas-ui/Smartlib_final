// borrows.js - Fungsi untuk peminjaman dan riwayat

// Fungsi untuk load form peminjaman
async function loadBorrowForm() {
    const bookSelect = document.getElementById('bookSelect');
    const booksSnapshot = await firebase.firestore().collection('books').where('available', '==', true).get();
    booksSnapshot.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().title;
        bookSelect.appendChild(option);
    });
}

// Fungsi untuk submit peminjaman
async function submitBorrow(event) {
    event.preventDefault();
    const user = firebase.auth().currentUser;
    const bookId = document.getElementById('bookSelect').value;

    try {
        await firebase.firestore().collection('borrow_records').add({
            userId: user.uid,
            bookId: bookId,
            borrowDate: firebase.firestore.Timestamp.now(),
            status: 'pending'
        });
        alert('Peminjaman diajukan!');
        window.location.href = 'history.html';
    } catch (error) {
        alert('Error: ' + error.message);
    }
}
document.getElementById('borrowForm').addEventListener('submit', submitBorrow);

// Fungsi untuk load riwayat peminjaman
async function loadBorrowHistory() {
    const user = firebase.auth().currentUser;
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    const borrowsSnapshot = await firebase.firestore().collection('borrow_records').where('userId', '==', user.uid).get();
    borrowsSnapshot.forEach(async doc => {
        const borrow = doc.data();
        const bookDoc = await firebase.firestore().collection('books').doc(borrow.bookId).get();
        const book = bookDoc.data();
        const historyItem = `
            <div class="bg-white shadow-lg rounded-lg p-4">
                <h3 class="text-lg font-semibold">${book.title}</h3>
                <p>Status: ${borrow.status}</p>
                <p>Tanggal Pinjam: ${borrow.borrowDate.toDate().toLocaleDateString()}</p>
                ${borrow.returnDate ? `<p>Tanggal Kembali: ${borrow.returnDate.toDate().toLocaleDateString()}</p>` : ''}
            </div>
        `;
        historyList.innerHTML += historyItem;
    });
}
