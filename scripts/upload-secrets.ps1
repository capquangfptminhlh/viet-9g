Write-Host "Đang mở trình duyệt để Sếp cấp quyền Github (Bấm Continue là được)..." -ForegroundColor Cyan
& "C:\Program Files\GitHub CLI\gh.exe" auth login --web

Write-Host "
Đang quét file .env để hút 7 cái Gemini API Key..." -ForegroundColor Cyan
$envPath = "D:\Du_Lieu_O_C_Chuyen_Sang\Codex\2026-06-12\t-i-mu-n-k-t\work\viettel-data-extracted\.env"
Get-Content $envPath | Where-Object { $_ -match "^GEMINI_API_KEY_" } | ForEach-Object {
    $parts = $_ -split '=', 2
    $key = $parts[0]
    $val = $parts[1]
    Write-Host "-> Bắn $key lên Github Secrets..." -ForegroundColor Yellow
    $val | & "C:\Program Files\GitHub CLI\gh.exe" secret set $key
}
Write-Host "
✅ Báo cáo Sếp: Đã up xong toàn bộ 7 API Key! Sáng mai bot tự chạy ngon ơ." -ForegroundColor Green
