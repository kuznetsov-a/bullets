# Get the directory path
$directory = "C:\Users\tctwc\OneDrive\VSCode\mobile_bullets\assets\audio"

# Get the source file content
$sourceFile = Join-Path $directory "1-second-of-silence.mp3"
$sourceContent = Get-Content $sourceFile -Raw -Encoding Byte

# Get all other MP3 files in the directory
$targetFiles = Get-ChildItem -Path $directory -Filter "*.mp3" | Where-Object { $_.Name -ne "1-second-of-silence.mp3" }

# Copy the content to each target file
foreach ($file in $targetFiles) {
    Write-Host "Copying content to $($file.Name)..."
    Set-Content -Path $file.FullName -Value $sourceContent -Encoding Byte
}

Write-Host "Done! All files have been updated."