<?php
declare(strict_types=1);

/**
 * AutoLead Database Configuration (Singleton PDO Pattern)
 * Path: C:/xampp/htdocs/autolead/config/db.php
 */

class Database
{
    private static ?PDO $instance = null;

    private const DB_HOST = '127.0.0.1';
    private const DB_PORT = '3306';
    private const DB_NAME = 'autolead_db';
    private const DB_USER = 'root';
    private const DB_PASS = '';
    private const DB_CHARSET = 'utf8mb4';

    private function __construct()
    {
        // Private constructor prevents direct instantiation
    }

    private function __clone()
    {
        // Prevent cloning of the singleton instance
    }

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                self::DB_HOST,
                self::DB_PORT,
                self::DB_NAME,
                self::DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, self::DB_USER, self::DB_PASS, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'Database connection failed. Ensure MySQL is running in XAMPP and autolead_db is imported.',
                    'error'   => $e->getMessage()
                ]);
                exit;
            }
        }

        return self::$instance;
    }
}