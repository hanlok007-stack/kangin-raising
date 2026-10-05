# 출시용 서명 키(업로드 키)를 만든다. 한 번만 실행한다.
# 비밀번호는 직접 정해서 입력한다. 이 키와 비밀번호를 잃어버리면 앱을 업데이트할 때 곤란해지니
# android\upload-keystore.jks 파일과 비밀번호를 따로 안전한 곳에 보관한다.
$jdk = $env:JAVA_HOME
if (-not $jdk) { $jdk = 'C:\Users\eetlk\android-dev\jdk' }
$android = Join-Path (Split-Path $PSScriptRoot -Parent) 'android'
$ks = Join-Path $android 'upload-keystore.jks'
$props = Join-Path $android 'keystore.properties'

if (Test-Path $ks) {
    Write-Host "이미 키가 있습니다: $ks"
    Write-Host '새로 만들려면 이 파일을 직접 지우고 다시 실행하세요. (이미 스토어에 올린 앱이 있다면 지우면 안 됩니다)'
    exit 1
}

Write-Host '서명 키를 만듭니다. 비밀번호(6자 이상)를 두 번 묻고, 이름·조직 등을 묻습니다.'
Write-Host '이름 등은 비워 두고 Enter를 눌러도 됩니다. 마지막에 "예" 또는 "yes"로 확인합니다.'
& "$jdk\bin\keytool.exe" -genkeypair -v -keystore $ks -alias upload -keyalg RSA -keysize 2048 -validity 10000
if (-not (Test-Path $ks)) {
    Write-Host '키가 만들어지지 않았습니다.'
    exit 1
}

$pw = Read-Host '방금 정한 비밀번호를 한 번 더 입력하세요 (빌드 설정 파일에 저장됩니다. 화면에 보입니다)'
$lines = @('storeFile=../upload-keystore.jks', "storePassword=$pw", 'keyAlias=upload', "keyPassword=$pw")
Set-Content -Path $props -Value $lines -Encoding ascii
Write-Host ''
Write-Host "완료: $ks"
Write-Host "빌드 설정: $props (저장소에는 올라가지 않습니다)"
Write-Host '이제 npm run app:release 로 서명된 AAB를 만들 수 있습니다.'
