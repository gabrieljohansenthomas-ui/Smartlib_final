// auth.js - Menangani autentikasi, register, login, logout, dan proteksi halaman

// Fungsi untuk register user baru
async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        // Simpan data user ke Firestore
        await firebase.firestore().collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            name: name,
            role: role
        });
        alert('Registrasi berhasil!');
        window.location.href = 'login.html';
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Fungsi untuk login
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        alert('Login berhasil!');
        // Redirect berdasarkan role akan ditangani di checkAuthAndRedirect
        checkAuthAndRedirect();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Fungsi logout
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        alert('Error: ' + error.message);
    });
}

// Fungsi untuk cek autentikasi dan redirect berdasarkan role
async function checkAuthAndRedirect() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // Ambil data user dari Firestore
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const role = userDoc.data().role;
                if (role === 'admin') {
                    window.location.href = 'dashboard-admin.html';
                } else {
                    window.location.href = 'dashboard-member.html';
                }
            }
        } else {
            // Jika tidak login, tetap di halaman saat ini (untuk index, login, register)
        }
    });
}

// Fungsi untuk proteksi halaman berdasarkan role
async function checkAuthAndRole(requiredRole) {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== requiredRole) {
            window.location.href = 'login.html';
        }
    });
}
