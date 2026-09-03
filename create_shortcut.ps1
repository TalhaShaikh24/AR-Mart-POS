$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "AR Mart POS (Direct Silent Print).lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "c:\Users\hp\Desktop\AR Mart POS\Start_AR_Mart_Silent_POS.bat"
$Shortcut.WorkingDirectory = "c:\Users\hp\Desktop\AR Mart POS"
$Shortcut.Description = "AR Mart POS - Direct Silent Print (Zero Popup)"
$Shortcut.Save()
Write-Host "Desktop Shortcut Created Successfully at: $ShortcutPath"
