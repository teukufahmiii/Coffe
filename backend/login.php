<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight options request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

// Hardcoded admin credentials
$admin_email = 'admin@gmail.com';
$admin_password = 'admin123';

if ($email === $admin_email && $password === $admin_password) {
    // Generate a simple token (in production, use JWT)
    $token = bin2hex(random_bytes(16));
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'email' => $email,
            'role' => 'admin'
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid email or password'
    ]);
}
