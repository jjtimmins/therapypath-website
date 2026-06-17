$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$bookingUrl = 'https://theramatic.ca/request-appointment/the-therapy-path'

$htmlFiles = Get-ChildItem -Path $root -Recurse -Filter '*.html' -File |
  Where-Object { $_.FullName -notmatch '\\_archive\\' }

foreach ($file in $htmlFiles) {
  $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

  $content = $content.Replace('../static.wixstatic.com/', 'https://static.wixstatic.com/')
  $content = $content.Replace('../static.parastorage.com/', 'https://static.parastorage.com/')
  $content = $content.Replace('http://static.parastorage.com/', 'https://static.parastorage.com/')
  $content = $content.Replace('http://static.wixstatic.com/', 'https://static.wixstatic.com/')

  $content = $content -replace 'href="book-online\.html"', "href=`"$bookingUrl`" target=`"_blank`" rel=`"noopener noreferrer`""
  $content = $content -replace 'href="\.\./book-online\.html"', "href=`"$bookingUrl`" target=`"_blank`" rel=`"noopener noreferrer`""
  $content = $content -replace 'href="(\.\./)*fr/book-online\.html"', "href=`"$bookingUrl`" target=`"_blank`" rel=`"noopener noreferrer`""

  if ($content -notmatch 'site-fixes\.css') {
    $content = $content -replace '</head>', "  <link rel=`"stylesheet`" href=`"/site-fixes.css`" />`n</head>"
  }

  if ($content -notmatch 'site-fixes\.js') {
    $content = $content -replace '</body>', "  <script src=`"/site-fixes.js`" defer></script>`n</body>"
  }

  try {
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
  } catch {
    Write-Warning "Skipped $($file.Name): $($_.Exception.Message)"
  }
}

python (Join-Path $PSScriptRoot 'fix-hero.py')
python (Join-Path $PSScriptRoot 'fix-contact-form.py')
python (Join-Path $PSScriptRoot 'fix-nav-links.py')
python (Join-Path $PSScriptRoot 'fix-seo-meta.py')
python (Join-Path $PSScriptRoot 'collect-image-usage.py')
python (Join-Path $PSScriptRoot 'prepare-images.py')
python (Join-Path $PSScriptRoot 'localize-images.py')
python (Join-Path $PSScriptRoot 'inject-lcp-preload.py')
python (Join-Path $PSScriptRoot 'inject-site-fixes.py')

Write-Host "Patched $($htmlFiles.Count) HTML files."
