// member.js - Fungsi untuk dashboard member, profil, dll.

// Fungsi untuk load dashboard member
async function loadMemberDashboard() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
    document.getElementById('userName').textContent = userDoc.data().name;

    // Hitung buku tersedia
    const booksSnapshot = await firebase.firestore().collection('books').where('available', '==', true).get();
    document.getElementById('availableBooks').textContent = booksSnapshot.size;

    // Hitung peminjaman aktif
    const activeBorrows = await firebase.firestore().collection('borrow_records').where('userId', '==', user.uid).where('status', '==', 'approved').get();
    document.getElementById('activeBorrows').textContent = activeBorrows.size;

    // Hitung riwayat peminjaman
    const historyBorrows = await firebase.firestore().collection('borrow_records').where('userId', '==', user.uid).get();
    document.getElementById('borrowHistory').textContent = historyBorrows.size;
}

// Fungsi untuk load profil
async function loadProfile() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
    document.getElementById('name').value = userDoc.data().name;
}

// Fungsi untuk update profil
async function updateProfile(event) {
    event.preventDefault();
    const user = firebase.auth().currentUser;
    const name = document.getElementById('name').value;
    const photoFile = document.getElementById('photo').files[0];

    try {
        let photoURL = null;
        if (photoFile) {
            const storageRef = firebase.storage().ref();
            const photoRef = storageRef.child(`profiles/${user.uid}`);
            await photoRef.put(photoFile);
            photoURL = await photoRef.getDownloadURL();
        }

        await firebase.firestore().collection('users').doc(user.uid).update({
            name: name,
            photoURL: photoURL
        });
        alert('Profil berhasil diupdate!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}
document.getElementById('profileForm').addEventListener('submit', updateProfile);
