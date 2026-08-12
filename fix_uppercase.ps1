$files = Get-ChildItem -Path 'src/pages/*.jsx','src/components/*.jsx'
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  $content = $content -replace ' uppercase', ''
  Set-Content -Path $f.FullName -Value $content -NoNewline
}
Write-Host "Done removing 'uppercase' class from all JSX files."
