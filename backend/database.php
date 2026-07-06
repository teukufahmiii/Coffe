<?php
// backend/database.php
// Placeholder for database connection when PHP is fully integrated
// It will connect to the Supabase PostgreSQL database using PDO

function getDbConnection() {
    // In production, these should come from environment variables or .env file
    // Example format for Supabase PostgreSQL connection
    $host = 'db.abtddrxdqnaxjmdnnuwz.supabase.co'; // Replace with actual host if different
    $port = '5432';
    $dbname = 'postgres';
    $user = 'postgres'; // Replace with actual user
    $password = ''; // Replace with actual password

    try {
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
