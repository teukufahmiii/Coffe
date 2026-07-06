<?php
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => 'LNR Coffee Backend API is running.',
    'version' => '1.0.0'
]);
