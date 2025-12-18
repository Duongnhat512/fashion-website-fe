# Script to update all components

$files = Get-ChildItem -Path "e:\Hoc Tap\DO_AN\fashion-website-nextjs\src\components" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $contentStr = $content -join "`r`n"
    
    # Skip if already has 'use client'
    if ($contentStr -match "^'use client';") {
        continue
    }
    
    # Check if has hooks or interactive features
    if ($contentStr -match "(useState|useEffect|useRouter|useNavigate|onClick|onChange|useContext)") {
        # Add 'use client' at the beginning
        $newContent = @("'use client';", "") + $content
        
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Done updating components!"
