<?php
declare(strict_types=1);

/**
 * AutoLead Secure CLI Account Provisioning Tool
 * Path: D:/xampp/htdocs/Autolead/config/create_user_cli.php
 * Usage in Command Prompt:
 *   D:\xampp\php\php.exe D:\xampp\htdocs\Autolead\config\create_user_cli.php
 */

// Strictly block any web browser access
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('403 Forbidden: This script can only be executed from the command line.');
}

require_once __DIR__ . '/db.php';

echo "============================================================\n";
echo " AutoLead Secure Credential Provisioning Utility (CLI)\n";
echo "============================================================\n\n";

$roleInput = strtolower(trim((string) readline("1. Enter Role (admin / employee): ")));
if (!in_array($roleInput, ['admin', 'employee'], true)) {
    exit("[ERROR] Role must be exactly 'admin' or 'employee'.\n");
}

$empCode = strtoupper(trim((string) readline("2. Enter Employee Code (e.g., ADMIN02 or EMP004): ")));
if (!preg_match('/^(ADMIN|EMP)[0-9]{2,5}$/', $empCode)) {
    exit("[ERROR] Invalid format. Use ADMIN01-ADMIN99 or EMP001-EMP99999.\n");
}

$username = strtolower(trim((string) readline("3. Enter Username (e.g., soumyaditya.roy): ")));
if (!preg_match('/^[a-z0-9._-]{4,40}$/', $username)) {
    exit("[ERROR] Username must be 4-40 characters (lowercase letters, numbers, dots, hyphens, underscores).\n");
}

$fullName = trim((string) readline("4. Enter Full Name: "));
if (strlen($fullName) < 2 || strlen($fullName) > 100) {
    exit("[ERROR] Full name must be between 2 and 100 characters.\n");
}

$password = (string) readline("5. Enter Strong Password (min 10 chars, upper, lower, digit, symbol): ");
$passwordRegex = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,72}$/';
if (!preg_match($passwordRegex, $password)) {
    exit("[ERROR] Password is too weak. Must be at least 10 characters and include uppercase, lowercase, number, and special symbol.\n");
}

// Generate cryptographic hash using Argon2id if supported, otherwise Bcrypt with cost 12
$algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
$options = $algo === PASSWORD_BCRYPT ? ['cost' => 12] : [];
$passwordHash = password_hash($password, $algo, $options);

try {
    $pdo = Database::getConnection();

    // Check if employee_code or username already exists
    $checkStmt = $pdo->prepare(
        "SELECT id, employee_code, username
         FROM users
         WHERE LOWER(employee_code) = LOWER(:code) OR LOWER(username) = LOWER(:user)
         LIMIT 1"
    );
    $checkStmt->execute([
        ':code' => $empCode,
        ':user' => $username
    ]);

    if ($existing = $checkStmt->fetch()) {
        $updateChoice = strtolower(trim((string) readline(
            "[NOTICE] Account already exists ({$existing['employee_code']} / {$existing['username']}). Rotate password? (y/n): "
        )));

        if ($updateChoice === 'y') {
            $upd = $pdo->prepare(
                "UPDATE users
                 SET password_hash = :hash, full_name = :name, role = :role
                 WHERE id = :id"
            );
            $upd->execute([
                ':hash' => $passwordHash,
                ':name' => $fullName,
                ':role' => $roleInput,
                ':id'   => (int) $existing['id']
            ]);
            echo "\n[SUCCESS] Password and profile updated for {$existing['employee_code']}.\n";
            exit(0);
        }
        exit("\n[ABORTED] No changes made.\n");
    }

    // Insert new user with prepared statement
    $insertStmt = $pdo->prepare(
        "INSERT INTO users (employee_code, username, password_hash, full_name, role, created_at)
         VALUES (:code, :user, :hash, :name, :role, NOW())"
    );
    $insertStmt->execute([
        ':code' => $empCode,
        ':user' => $username,
        ':hash' => $passwordHash,
        ':name' => $fullName,
        ':role' => $roleInput
    ]);

    echo "\n[SUCCESS] Account provisioned securely!\n";
    echo "  - Role          : {$roleInput}\n";
    echo "  - Employee Code : {$empCode}\n";
    echo "  - Username      : {$username}\n";
    echo "  - Hash Algorithm: " . ($algo === PASSWORD_ARGON2ID ? 'Argon2id' : 'Bcrypt (Cost 12)') . "\n";
} catch (Throwable $e) {
    exit("\n[DATABASE ERROR] " . $e->getMessage() . "\n");
}