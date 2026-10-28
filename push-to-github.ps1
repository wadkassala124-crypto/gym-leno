Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   GYM and LENO - Push to GitHub (wadkassala124-crypto)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$gitCmd = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
if (-not (Test-Path $gitCmd)) {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitCmd = "git"
    } else {
        Write-Host "[!] Git is not installed." -ForegroundColor Red
        exit 1
    }
}

$repoPath = "C:\Users\anwar\.gemini\antigravity\scratch\gym-leno"
Set-Location -Path $repoPath

Write-Host "[1/3] Configuring account: wadkassala124-crypto (wadkassala124@gmail.com)..." -ForegroundColor Cyan
& $gitCmd config user.email "wadkassala124@gmail.com"
& $gitCmd config user.name "wadkassala124-crypto"
& $gitCmd remote set-url origin https://github.com/wadkassala124-crypto/78.git

Write-Host "[2/3] Setting branch to main..." -ForegroundColor Cyan
& $gitCmd branch -M main

Write-Host "[3/3] Pushing to GitHub (https://github.com/wadkassala124-crypto/78)..." -ForegroundColor Yellow
Write-Host "If your browser opens, sign in with wadkassala124@gmail.com and click Authorize." -ForegroundColor Yellow
Write-Host ""

& $gitCmd push -u origin main

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Pushed to repository '78' successfully! 🎉" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Step on Vercel:" -ForegroundColor Cyan
    Write-Host "1. Open: https://vercel.com/signup and click 'Continue with GitHub'" -ForegroundColor White
    Write-Host "2. Click 'Import' next to the '78' repository." -ForegroundColor White
    Write-Host "3. In Environment Variables add:" -ForegroundColor White
    Write-Host "   ADMIN_USER = yassin" -ForegroundColor White
    Write-Host "   ADMIN_PASSWORD = YassinAnwar123" -ForegroundColor White
    Write-Host "4. Click Deploy!" -ForegroundColor White
} else {
    Write-Host "[!] Push was not completed. Please check your credentials." -ForegroundColor Red
}
Write-Host ""