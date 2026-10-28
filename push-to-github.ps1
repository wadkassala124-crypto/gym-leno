# ========================================================
# Gym & Leno - Quick GitHub & Vercel Connect Script
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   GYM & LENO - ربط الموقع بـ GitHub و Vercel التلقائي" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if git command exists
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[!] تنبيه: Git غير مثبت على جهازك حالياً." -ForegroundColor Yellow
    Write-Host "[*] جاري محاولة تثبيت Git تلقائياً عبر Windows Package Manager..." -ForegroundColor Cyan
    winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
    Write-Host "[✓] يرجى إعادة فتح نافذة PowerShell بعد انتهاء التثبيت وتشغيل هذا الملف مجدداً." -ForegroundColor Green
    exit
}

# Ask for repository URL if not provided
$repoUrl = Read-Host "أدخل رابط مستودع GitHub الخاص بك (مثال: https://github.com/USERNAME/gym-leno.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "[X] لم يتم إدخال رابط المستودع. تم إلغاء العملية." -ForegroundColor Red
    exit
}

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "[1/5] جاري تهيئة مستودع Git محلياً..." -ForegroundColor Cyan
    git init
}

Write-Host "[2/5] جاري إضافة وتجهيز جميع ملفات المشروع..." -ForegroundColor Cyan
git add .

Write-Host "[3/5] جاري حفظ الإصدار (Commit)..." -ForegroundColor Cyan
git commit -m "feat: complete Gym & Leno production system with cybersecurity patches"

Write-Host "[4/5] جاري ضبط الفرع الرئيسي (main)..." -ForegroundColor Cyan
git branch -M main

Write-Host "[5/5] جاري الربط بالمستودع ورفع الأكواد إلى GitHub..." -ForegroundColor Cyan
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin $repoUrl.Trim()

git push -u origin main

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
