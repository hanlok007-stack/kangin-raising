# 웹을 빌드하고 안드로이드 앱을 만든다.
#   결과물: C:\Users\eetlk\android-dev\kangin-debug.apk   (휴대폰에 바로 설치해 보는 용)
#           C:\Users\eetlk\android-dev\kangin-release.aab (Play Console에 올리는 용. 서명 키가 있을 때만 서명된다)
if (-not $env:JAVA_HOME) { $env:JAVA_HOME = 'C:\Users\eetlk\android-dev\jdk' }
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = 'C:\Users\eetlk\android-dev\sdk' }
$root = Split-Path $PSScriptRoot -Parent
$out = 'C:\Users\eetlk\android-dev'
Set-Location $root

npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit 1 }

Set-Location (Join-Path $root 'android')
& .\gradlew.bat assembleDebug bundleRelease --no-daemon
if ($LASTEXITCODE -ne 0) { exit 1 }

Copy-Item 'app\build\outputs\apk\debug\app-debug.apk' (Join-Path $out 'kangin-debug.apk') -Force
Copy-Item 'app\build\outputs\bundle\release\app-release.aab' (Join-Path $out 'kangin-release.aab') -Force
$signed = Test-Path 'keystore.properties'
Write-Host ''
Write-Host "APK: $out\kangin-debug.apk"
if ($signed) { Write-Host "AAB: $out\kangin-release.aab (서명됨 — Play Console에 올릴 수 있습니다)" }
else { Write-Host "AAB: $out\kangin-release.aab (서명 전 — 먼저 npm run app:key 로 서명 키를 만드세요)" }
