# Script to update all pages from React Router to Next.js

$files = Get-ChildItem -Path "e:\Hoc Tap\DO_AN\fashion-website-nextjs\app" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has 'use client'
    if ($content -match "^'use client';") {
        continue
    }
    
    # Check if has hooks or interactive features
    if ($content -match "(useState|useEffect|useRouter|useNavigate|onClick|onChange)") {
        # Add 'use client' at the beginning
        $newContent = "'use client';`r`n`r`n" + $content
        
        # Replace useNavigate with useRouter
        $newContent = $newContent -replace "import.*useNavigate.*from.*react-router-dom.*", "import { useRouter } from 'next/navigation';"
        $newContent = $newContent -replace "const\s+(\w+)\s*=\s*useNavigate\(\);", 'const $1 = useRouter();'
        
        # Update imports
        $newContent = $newContent -replace 'from\s+"\.\./services/', 'from "@/src/services/'
        $newContent = $newContent -replace 'from\s+"\.\./contexts/', 'from "@/src/contexts/'
        $newContent = $newContent -replace 'from\s+"\.\./types/', 'from "@/src/types/'
        $newContent = $newContent -replace 'from\s+"\.\./components/', 'from "@/src/components/'
        $newContent = $newContent -replace 'from\s+"\.\./config/', 'from "@/src/config/'
        $newContent = $newContent -replace 'from\s+"\.\./store/', 'from "@/src/store/'
        
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host ""
Write-Host "Done!"
