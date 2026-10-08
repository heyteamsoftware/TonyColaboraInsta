<?php
// Contador de visitantes únicos. Cada navegador envía un identificador anónimo
// aleatorio; aquí solo se guarda su hash (no IP ni datos personales).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$dir  = __DIR__ . '/data';
$file = $dir . '/visitantes.json';
if (!is_dir($dir)) { @mkdir($dir, 0775, true); }
if (!is_file($dir . '/.htaccess')) { @file_put_contents($dir . '/.htaccess', "Require all denied\n"); }

$id = $_POST['id'] ?? '';
$valido = preg_match('/^[A-Za-z0-9-]{16,64}$/', $id) === 1;

$fp = fopen($file, 'c+');
if (!$fp) { http_response_code(500); echo json_encode(['error' => 'sin acceso a datos']); exit; }
flock($fp, LOCK_EX);
$visitantes = json_decode(stream_get_contents($fp), true);
if (!is_array($visitantes)) { $visitantes = []; }

if ($valido) {
  $h = hash('sha256', $id);
  if (!isset($visitantes[$h])) {
    $visitantes[$h] = 1;
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($visitantes));
  }
}
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode(['total' => count($visitantes)]);
