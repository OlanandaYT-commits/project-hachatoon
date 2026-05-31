$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$main = Join-Path (Split-Path -Parent $here) "project-hachatoon"
Write-Host "Restore $main from backup? (y/n)"
if ((Read-Host) -ne "y") { exit }
if (Test-Path $main) { Remove-Item -Recurse -Force $main }
robocopy $here $main /E /XD node_modules .next
Write-Host "Done. Run: cd project-hachatoon; npm install; npm run dev"
