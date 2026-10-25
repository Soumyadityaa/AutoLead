@echo off
setlocal EnableExtensions

:: ============================================================================
:: AutoLead Directory & File Scaffolding Script
:: Target Root: D:\xampp\htdocs\Autolead
:: ============================================================================

set "ROOT_DIR=D:\xampp\htdocs\Autolead"

echo [AutoLead] Initializing project structure at: %ROOT_DIR%
echo.

:: 1. Create Directory Tree
set DIRS=^
 "%ROOT_DIR%"^
 "%ROOT_DIR%\asset"^
 "%ROOT_DIR%\config"^
 "%ROOT_DIR%\database"^
 "%ROOT_DIR%\api"^
 "%ROOT_DIR%\admin"^
 "%ROOT_DIR%\employee"^
 "%ROOT_DIR%\css"^
 "%ROOT_DIR%\css\admin"^
 "%ROOT_DIR%\css\employee"^
 "%ROOT_DIR%\js"^
 "%ROOT_DIR%\js\admin"^
 "%ROOT_DIR%\js\employee"

for %%D in (%DIRS%) do (
    if not exist %%D (
        mkdir %%D
        echo [DIR CREATED]  %%~D
    ) else (
        echo [DIR EXISTS]   %%~D
    )
)

echo.
echo [AutoLead] Scaffolding project files...
echo.

:: 2. Root Entry
call :create_file "%ROOT_DIR%\index.html"

:: 3. Backend Configuration & Security
call :create_file "%ROOT_DIR%\config\db.php"
call :create_file "%ROOT_DIR%\config\session.php"

:: 4. Database Schema & Initial Data
call :create_file "%ROOT_DIR%\database\autolead.sql"

:: 5. REST-like PHP JSON Endpoints
call :create_file "%ROOT_DIR%\api\auth.php"
call :create_file "%ROOT_DIR%\api\admin_api.php"
call :create_file "%ROOT_DIR%\api\employee_api.php"

:: 6. Admin Panel Views (6 HTML Pages)
call :create_file "%ROOT_DIR%\admin\dashboard.html"
call :create_file "%ROOT_DIR%\admin\employee-monitoring.html"
call :create_file "%ROOT_DIR%\admin\lead-preview.html"
call :create_file "%ROOT_DIR%\admin\tasks.html"
call :create_file "%ROOT_DIR%\admin\analytics.html"
call :create_file "%ROOT_DIR%\admin\add-lead.html"

:: 7. Employee Panel Views (6 HTML Pages)
call :create_file "%ROOT_DIR%\employee\dashboard.html"
call :create_file "%ROOT_DIR%\employee\campaigns.html"
call :create_file "%ROOT_DIR%\employee\smart-views.html"
call :create_file "%ROOT_DIR%\employee\manage-lead.html"
call :create_file "%ROOT_DIR%\employee\manage-activity.html"
call :create_file "%ROOT_DIR%\employee\manage-task.html"

:: 8. Cascade-Driven Stylesheets (12 CSS Files)
call :create_file "%ROOT_DIR%\css\style.css"
call :create_file "%ROOT_DIR%\css\auth.css"
call :create_file "%ROOT_DIR%\css\admin\dashboard.css"
call :create_file "%ROOT_DIR%\css\admin\employee-monitoring.css"
call :create_file "%ROOT_DIR%\css\admin\lead-preview.css"
call :create_file "%ROOT_DIR%\css\admin\tasks.css"
call :create_file "%ROOT_DIR%\css\admin\analytics.css"
call :create_file "%ROOT_DIR%\css\admin\add-lead.css"
call :create_file "%ROOT_DIR%\css\employee\dashboard.css"
call :create_file "%ROOT_DIR%\css\employee\campaigns.css"
call :create_file "%ROOT_DIR%\css\employee\smart-views.css"
call :create_file "%ROOT_DIR%\css\employee\manage-tables.css"

:: 9. Modular ES6+ Scripts (13 JS Files)
call :create_file "%ROOT_DIR%\js\main.js"
call :create_file "%ROOT_DIR%\js\auth.js"
call :create_file "%ROOT_DIR%\js\admin\dashboard.js"
call :create_file "%ROOT_DIR%\js\admin\employee-monitoring.js"
call :create_file "%ROOT_DIR%\js\admin\lead-preview.js"
call :create_file "%ROOT_DIR%\js\admin\tasks.js"
call :create_file "%ROOT_DIR%\js\admin\analytics.js"
call :create_file "%ROOT_DIR%\js\admin\add-lead.js"
call :create_file "%ROOT_DIR%\js\employee\nav-dropdown.js"
call :create_file "%ROOT_DIR%\js\employee\dashboard.js"
call :create_file "%ROOT_DIR%\js\employee\campaigns.js"
call :create_file "%ROOT_DIR%\js\employee\smart-views.js"
call :create_file "%ROOT_DIR%\js\employee\manage-tables.js"

echo.
echo ============================================================================
echo [SUCCESS] AutoLead folder tree and files are ready at:
echo           %ROOT_DIR%
echo.
echo [NOTE]    Copy your actual icon.png and logo.png image files into:
echo           %ROOT_DIR%\asset\
echo ============================================================================
echo.
pause
exit /b 0

:: Subroutine to create an empty file only if it does not already exist
:create_file
if not exist "%~1" (
    type nul > "%~1"
    echo [FILE CREATED] %~1
) else (
    echo [FILE EXISTS]  %~1
)
exit /b 0