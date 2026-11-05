# Servidor local simples (sem instalar nada). Feche a janela ou use Ctrl+C para parar.
$port = 8000
$root = [IO.Path]::GetFullPath($PSScriptRoot)
$mime = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8';
           '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml'; '.webp'='image/webp';
           '.ico'='image/x-icon'; '.json'='application/json'; '.webmanifest'='application/manifest+json' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$port/")
try { $l.Start() } catch { Write-Host "Nao foi possivel iniciar na porta $port. Feche outro servidor aberto e tente de novo."; exit 1 }
Write-Host ""
Write-Host "Servidor rodando!"
Write-Host "  Cardapio: http://localhost:$port/index.html"
Write-Host "  Admin:    http://localhost:$port/admin/admin.html"
Write-Host ""
Write-Host "Deixe esta janela aberta enquanto testa. Para parar, feche-a."
Start-Process "http://localhost:$port/index.html"
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $p = [uri]::UnescapeDataString($c.Request.Url.LocalPath.TrimStart('/'))
    if ($p -eq '') { $p = 'index.html' }
    $f = [IO.Path]::GetFullPath((Join-Path $root $p))
    if ($f.StartsWith($root) -and (Test-Path $f -PathType Leaf)) {
      $ext = [IO.Path]::GetExtension($f).ToLower()
      $c.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $b = [IO.File]::ReadAllBytes($f)
      $c.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $c.Response.StatusCode = 404 }
  } catch { $c.Response.StatusCode = 500 }
  $c.Response.Close()
}
