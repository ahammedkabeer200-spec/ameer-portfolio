$data = Get-Content 'data/projects.json' -Raw | ConvertFrom-Json
$filtered = $data | Where-Object { $_.id -ne 'untitled-project' }
$filtered | ConvertTo-Json -Depth 10 | Set-Content 'data/projects.json' -Encoding UTF8
