@echo off
echo.
echo ========================================
echo    TEMPORARY FIREWALL DISABLE FOR TESTING
echo ========================================
echo.
echo ⚠️  WARNING: This will temporarily disable Windows Firewall
echo    Only use this for testing mobile connectivity
echo    Remember to re-enable it after testing
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" goto :end

echo.
echo 🔧 Disabling Windows Firewall...
netsh advfirewall set allprofiles state off

if %errorlevel% equ 0 (
    echo ✅ Windows Firewall disabled successfully
    echo.
    echo 📱 Now test mobile access: http://192.168.88.241:5173
    echo.
    echo ⏰ Firewall will be re-enabled in 5 minutes...
    timeout /t 300 /nobreak >nul
    
    echo.
    echo 🔧 Re-enabling Windows Firewall...
    netsh advfirewall set allprofiles state on
    echo ✅ Windows Firewall re-enabled
) else (
    echo ❌ Failed to disable Windows Firewall
    echo 💡 Try running as Administrator
)

:end
echo.
echo Press any key to exit...
pause >nul 