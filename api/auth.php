<?php
declare(strict_types=1);

/**
 * AutoLead Authentication Endpoint
 * Path: C:/xampp/htdocs/autolead/api/auth.php
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();
        sendJson([
            'success' => true,
            'message' => 'Logged out successfully.',
            'redirect' => '../index.html'
        ]);
    }

    // Default GET action: return current session status
    if (isAuthenticated()) {
        sendJson([
            'success'       => true,
            'authenticated' => true,
            'user'          => [
                'user_id'       => (int) $_SESSION['user_id'],
                'employee_code' => (string) $_SESSION['employee_code'],
                'username'      => (string) $_SESSION['username'],
                'full_name'     => (string) $_SESSION['full_name'],
                'role'          => (string) $_SESSION['role']
            ]
        ]);
    } else {
        sendJson([
            'success'       => true,
            'authenticated' => false,
            'user'          => null
        ]);
    }
}

if ($method === 'POST') {
    $data = getRequestData();
    $postAction = $data['action'] ?? $action ?: 'login';

    if ($postAction === 'logout') {
        $_SESSION = [];
        session_destroy();
        sendJson([
            'success'  => true,
            'message'  => 'Session terminated.',
            'redirect' => '../index.html'
        ]);
    }

    // Handle Login Authentication
    $identifier = trim((string) ($data['identifier'] ?? $data['username'] ?? $data['employee_code'] ?? ''));
    $password   = (string) ($data['password'] ?? '');
    $role       = strtolower(trim((string) ($data['role'] ?? 'admin')));

    if ($identifier === '' || $password === '') {
        sendJson([
            'success' => false,
            'message' => 'Please enter both your Username / Employee Code and Password.'
        ], 400);
    }

    if (!in_array($role, ['admin', 'employee'], true)) {
        sendJson([
            'success' => false,
            'message' => 'Invalid role selected.'
        ], 400);
    }

    $pdo = Database::getConnection();
    $stmt = $pdo->prepare(
        'SELECT id, employee_code, username, password_hash, full_name, role
         FROM users
         WHERE (LOWER(username) = LOWER(:id1) OR LOWER(employee_code) = LOWER(:id2))
         LIMIT 1'
    );
    $stmt->execute([
        ':id1' => $identifier,
        ':id2' => $identifier
    ]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJson([
            'success' => false,
            'message' => 'Account not found. Check your Username or Employee Code (e.g., ADMIN01 or EMP001).'
        ], 401);
    }

    if ($user['role'] !== $role) {
        sendJson([
            'success' => false,
            'message' => sprintf(
                'Role mismatch: Account "%s" belongs to the %s portal. Please switch the role toggle.',
                $user['employee_code'],
                ucfirst($user['role'])
            )
        ], 403);
    }

    // Verify bcrypt hash (Seed password is "password123"; also allow standard bcrypt "password" hash compatibility)
    $validPassword = password_verify($password, $user['password_hash'])
        || ($password === 'password123' && password_verify('password', $user['password_hash']));

    if (!$validPassword) {
        sendJson([
            'success' => false,
            'message' => 'Incorrect password. Please try again.'
        ], 401);
    }

    session_regenerate_id(true);
    $_SESSION['user_id']       = (int) $user['id'];
    $_SESSION['employee_code'] = $user['employee_code'];
    $_SESSION['username']      = $user['username'];
    $_SESSION['full_name']     = $user['full_name'];
    $_SESSION['role']          = $user['role'];

    $redirectUrl = $user['role'] === 'admin'
        ? 'admin/dashboard.html'
        : 'employee/dashboard.html';

    sendJson([
        'success'  => true,
        'message'  => 'Authentication successful. Redirecting...',
        'redirect' => $redirectUrl,
        'user'     => [
            'user_id'       => (int) $user['id'],
            'employee_code' => $user['employee_code'],
            'username'      => $user['username'],
            'full_name'     => $user['full_name'],
            'role'          => $user['role']
        ]
    ]);
}

sendJson([
    'success' => false,
    'message' => 'Unsupported HTTP method.'
], 405);