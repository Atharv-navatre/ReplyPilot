@echo off
echo ========================================
echo ReplyPilot Project Setup
echo ========================================
echo.

echo Creating folder structure...

:: Root directories
mkdir extension 2>nul
mkdir backend 2>nul
mkdir docs 2>nul

:: Extension directories
mkdir extension\src 2>nul
mkdir extension\src\contents 2>nul
mkdir extension\src\components 2>nul
mkdir extension\src\components\ui 2>nul
mkdir extension\src\background 2>nul
mkdir extension\src\popup 2>nul
mkdir extension\src\lib 2>nul
mkdir extension\src\hooks 2>nul
mkdir extension\src\adapters 2>nul
mkdir extension\src\types 2>nul
mkdir extension\assets 2>nul

:: Backend directories
mkdir backend\src 2>nul
mkdir backend\src\routes 2>nul
mkdir backend\src\controllers 2>nul
mkdir backend\src\services 2>nul
mkdir backend\src\middleware 2>nul
mkdir backend\src\config 2>nul
mkdir backend\src\types 2>nul
mkdir backend\src\utils 2>nul
mkdir backend\src\providers 2>nul

echo Folder structure created!
echo.
echo ========================================
echo Next steps:
echo ========================================
echo 1. Copy all files from SETUP.md into their locations
echo 2. Run: cd extension ^&^& pnpm install
echo 3. Run: cd backend ^&^& npm install
echo 4. Run backend: cd backend ^&^& npm run dev
echo 5. Run extension: cd extension ^&^& pnpm dev
echo 6. Load extension in Chrome
echo ========================================
pause
