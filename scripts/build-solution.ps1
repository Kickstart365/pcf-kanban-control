param([string]$Version = "1.9.1.0")
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent
$solutionFolder = Join-Path $projectRoot "solutions/Kickstart365Kanban"
$outputFolder = Join-Path $projectRoot "out/solutions"
New-Item -ItemType Directory -Path $solutionFolder, $outputFolder -Force | Out-Null
Push-Location $solutionFolder
try {
    if (!(Test-Path "Kickstart365Kanban.cdsproj")) {
        pac solution init --publisher-name kickstart365 --publisher-prefix k365
        if ($LASTEXITCODE -ne 0) { throw "PAC solution init failed" }
        pac solution add-reference --path $projectRoot
        if ($LASTEXITCODE -ne 0) { throw "PAC solution reference failed" }
    }
    $solutionXmlPath = Join-Path $solutionFolder "src/Other/Solution.xml"
    if (!(Test-Path $solutionXmlPath)) { $solutionXmlPath = Join-Path $solutionFolder "Other/Solution.xml" }
    [xml]$solutionXml = Get-Content $solutionXmlPath -Raw
    $solutionXml.ImportExportXml.SolutionManifest.UniqueName = "Kickstart365Kanban"
    $solutionXml.ImportExportXml.SolutionManifest.Version = $Version
    $solutionXml.Save($solutionXmlPath)

    $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio/Installer/vswhere.exe"
    $msbuild = & $vswhere -latest -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe" | Select-Object -First 1
    if (!$msbuild) { throw "Visual Studio MSBuild was not found" }
    & $msbuild "Kickstart365Kanban.cdsproj" /restore /p:Configuration=Release /p:SolutionPackageType=Both /p:PcfBuildMode=production /verbosity:minimal
    if ($LASTEXITCODE -ne 0) { throw "Dataverse solution build failed" }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $types = @()
    foreach ($zip in Get-ChildItem "bin/Release/*.zip") {
        $archive = [IO.Compression.ZipFile]::OpenRead($zip.FullName)
        try {
            $entry = $archive.Entries | Where-Object { $_.FullName -ieq "solution.xml" } | Select-Object -First 1
            if (!$entry) { throw "Missing solution.xml in $($zip.Name)" }
            $reader = [IO.StreamReader]::new($entry.Open())
            try { [xml]$packed = $reader.ReadToEnd() } finally { $reader.Dispose() }
            if ($packed.ImportExportXml.SolutionManifest.UniqueName -ne "Kickstart365Kanban" -or
                $packed.ImportExportXml.SolutionManifest.Version -ne $Version) { throw "Unexpected solution identity/version" }
            $type = if ($packed.ImportExportXml.SolutionManifest.Managed -eq "1") { "managed" } else { "unmanaged" }
            $controlEntry = $archive.Entries | Where-Object { $_.FullName -match "Controls/.*/ControlManifest.xml$" } | Select-Object -First 1
            if (!$controlEntry) { throw "Missing packaged PCF manifest" }
            $reader = [IO.StreamReader]::new($controlEntry.Open())
            try { [xml]$control = $reader.ReadToEnd() } finally { $reader.Dispose() }
            if ($control.manifest.control.namespace -ne "kickstart365" -or $control.manifest.control.version -ne "1.9.1") {
                throw "Unexpected packaged control identity/version"
            }
            foreach ($numericDefault in @{ sidePaneWidth = "600"; closeDateWarningDays = "7" }.GetEnumerator()) {
                $property = $control.manifest.control.SelectSingleNode("property[@name='$($numericDefault.Key)']")
                if (!$property -or $property.'of-type' -ne "Whole.None" -or $property.'default-value' -ne $numericDefault.Value) {
                    throw "Missing or invalid packaged numeric default: $($numericDefault.Key)"
                }
            }
            if (!($archive.Entries | Where-Object { $_.FullName -match "Controls/.*/bundle.js$" })) { throw "Missing PCF bundle" }
            $types += $type
        } finally { $archive.Dispose() }
        $destination = Join-Path $outputFolder "Kickstart365Kanban_$($Version.Replace('.', '_'))_$type.zip"
        Copy-Item $zip.FullName $destination -Force
        "$((Get-FileHash $destination -Algorithm SHA256).Hash.ToLower())  $(Split-Path $destination -Leaf)" |
            Set-Content "$destination.sha256" -Encoding utf8
    }
    if (!("managed" -in $types) -or !("unmanaged" -in $types)) { throw "Both managed and unmanaged packages are required" }
    # Retain generated project metadata for review and subsequent source commits.
    $sourceRoot = Join-Path $outputFolder "source/solutions/Kickstart365Kanban"
    New-Item -ItemType Directory -Path $sourceRoot -Force | Out-Null
    Copy-Item "Kickstart365Kanban.cdsproj" $sourceRoot -Force
    if (Test-Path "src") { Copy-Item "src" $sourceRoot -Recurse -Force }
    elseif (Test-Path "Other") { Copy-Item "Other" $sourceRoot -Recurse -Force }
    Write-Host "Verified managed and unmanaged Kickstart365Kanban $Version packages."
} finally { Pop-Location }
