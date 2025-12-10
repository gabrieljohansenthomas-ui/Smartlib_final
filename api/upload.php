<?php
// Header untuk CORS dan JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Fungsi untuk validasi dan upload gambar
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Cek apakah file diupload
    if (!isset($_FILES['file'])) {
        echo json_encode(['status' => 'error', 'message' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['file'];
    $allowedTypes = ['image/jpeg', 'image/png'];
    $maxSize = 1 * 1024 * 1024; // 1 MB

    // Validasi MIME type
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only JPEG and PNG allowed.']);
        exit;
    }

    // Validasi ukuran file
    if ($file['size'] > $maxSize) {
        echo json_encode(['status' => 'error', 'message' => 'File size exceeds 1 MB.']);
        exit;
    }

    // Buat folder uploads jika belum ada
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Rename file dengan timestamp + random
    $timestamp = time();
    $random = rand(1000, 9999);
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFileName = $timestamp . '_' . $random . '.' . $extension;
    $uploadPath = $uploadDir . $newFileName;

    // Pindahkan file
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // URL publik (sesuaikan dengan domain InfinityFree Anda)
        $publicUrl = 'https://domainAnda/uploads/' . $newFileName;  // Ganti domainAnda dengan domain InfinityFree
        echo json_encode(['status' => 'success', 'url' => $publicUrl]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to upload file.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
