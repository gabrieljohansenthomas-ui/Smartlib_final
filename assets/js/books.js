// books.js - Fungsi untuk load dan display buku

// Fungsi untuk load daftar buku
async function loadBooks() {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';

    const booksSnapshot = await firebase.firestore().collection('books').where('available', '==', true).get();
    booksSnapshot.forEach(doc => {
        const book = doc.data();
        const bookCard = `
            <div class="bg-white shadow-lg rounded-lg p-4 card-hover">
                <img src="${book.coverURL || 'https://via.placeholder.com/150'}" alt="Cover" class="w-full h-48 object-cover rounded-lg mb-4">
                <h3 class="text-lg font-semibold">${book.title}</h3>
                <p class="text-gray-600">Penulis: ${book.author}</p>
                <p class="text-gray-500">${book.description}</p>
                <p class="text-gray-500">${book.description}</p>
                ${book.bookURL ? `<a href="${book.bookURL}" target="_blank" class="mt-2 inline-block bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition duration-300">Buka Buku</a>` : ''}
            </div>
        `;
        booksList.innerHTML += bookCard;
    });
}
