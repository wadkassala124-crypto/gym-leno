# ========================================================
# Gym & Leno - Quick GitHub & Vercel Connect Script
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   GYM & LENO - ربط الموقع بـ GitHub و Vercel التلقائي" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Locate git executable
$gitCmd = "git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    if (Test-Path "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe") {
        $gitCmd = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    } elseif (Test-Path "C:\Program Files\Git\cmd\git.exe") {
        $gitCmd = "C:\Program Files\Git\cmd\git.exe"
    } else {
        Write-Host "[!] تنبيه: Git غير مثبت على جهازك حالياً." -ForegroundColor Yellow
        exit
    }
}

# Check if origin is already configured
$existingRemote = & $gitCmd remote get-url origin 2>$null

if ([string]::IsNullOrWhiteSpace($existingRemote)) {
    $repoUrl = Read-Host "أدخل رابط مستودع GitHub الخاص بك (مثال: https://github.com/yassinanwar140-source/gem.git)"
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host "[X] لم يتم إدخال رابط المستودع. تم إلغاء العملية." -ForegroundColor Red
        exit
    }
    & $gitCmd remote add origin $repoUrl.Trim()
} else {
    Write-Host "[✓] المستودع المرتبط حالياً: $existingRemote" -ForegroundColor Green
}

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "[1/4] جاري تهيئة مستودع Git محلياً..." -ForegroundColor Cyan
    & $gitCmd init
}

Write-Host "[2/4] جاري تجهيز جميع ملفات المشروع وإصلاحات الأمان..." -ForegroundColor Cyan
& $gitCmd add .
& $gitCmd commit -m "feat: complete Gym & Leno production system with cybersecurity patches and responsive design" 2>$null

Write-Host "[3/4] ضبط الفرع الرئيسي (main)..." -ForegroundColor Cyan
& $gitCmd branch -M main

Write-Host "[4/4] جاري رفع الأكواد إلى GitHub (سيفتح المتصفح للموافقة لمرة واحدة إذا طُلب)..." -ForegroundColor Cyan
& $gitCmd push -u origin main

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " [✓] تم رفع موقع GYM & LENO إلى GitHub بنجاح! 🎉" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "الخطوة الأخيرة للربط مع Vercel:" -ForegroundColor Yellow
Write-Host "1. افتح الرابط: https://vercel.com/yassinanwar140-6807/gym-leno/settings/git" -ForegroundColor White
Write-Host "2. اضغط على زر 'Connect to Git' واختر مستودعك من القائمة." -ForegroundColor White
Write-Host "3. من الآن فصاعداً، أي تعديل ترفعه بـ 'git push' سيُنشر مباشرة على الموقع الحي تلقائياً!" -ForegroundColor Cyan
Write-Host ""
