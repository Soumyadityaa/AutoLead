<?php
declare(strict_types=1);

/**
 * AutoLead Session & Role-Based Access Control (RBAC) Middleware
 * Path: C:/xampp/htdocs/autolead/config/session.php
 */

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_strict_mode', '1');
    session_start();
}

/**
 * Send standard JSON API response headers and prevent caching of dynamic state.
 */
function setApiHeaders(): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
}

/**
 * Output JSON payload and terminate script execution.
 */
function sendJson(array $payload, int $statusCode = 200): void
{
    setApiHeaders();
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Parse incoming request data from either JSON body or standard POST/PUT/DELETE form data.
 */
function getRequestData(): array
{
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return !empty($_POST) ? $_POST : $_GET;
}

/**
 * Verify that a user is currently authenticated.
 */
function isAuthenticated(): bool
{
    return isset($_SESSION['user_id'], $_SESSION['employee_code'], $_SESSION['role']);
}

/**
 * Enforce authentication and optional specific role ('admin' or 'employee').
 */
function requireRole(?string $requiredRole = null): array
{
    if (!isAuthenticated()) {
        sendJson([
            'success'       => false,
            'authenticated' => false,
            'message'       => 'Authentication required. Please sign in.'
        ], 401);
    }

    if ($requiredRole !== null && $_SESSION['role'] !== $requiredRole) {
        sendJson([
            'success'       => false,
            'authenticated' => true,
            'message'       => 'Access denied. Insufficient role permissions.'
        ], 403);
    }

    return [
        'user_id'       => (int) $_SESSION['user_id'],
        'employee_code' => (string) $_SESSION['employee_code'],
        'username'      => (string) $_SESSION['username'],
        'full_name'     => (string) $_SESSION['full_name'],
        'role'          => (string) $_SESSION['role']
    ];
}

/**
 * Format a datetime string into a human-friendly relative string or clean timestamp.
 */
function formatRelativeTime(?string $dateTimeStr): string
{
    if (empty($dateTimeStr)) {
        return 'N/A';
    }
    $timestamp = strtotime($dateTimeStr);
    if ($timestamp === false) {
        return $dateTimeStr;
    }
    $diff = time() - $timestamp;
    if ($diff < 60) {
        return 'Just now';
    }
    if ($diff < 3600) {
        $mins = (int) floor($diff / 60);
        return $mins . ($mins === 1 ? ' min ago' : ' mins ago');
    }
    if ($diff < 86400 && date('Y-m-d', $timestamp) === date('Y-m-d')) {
        return 'Today, ' . date('h:i A', $timestamp);
    }
    return date('d M Y, h:i A', $timestamp);
}