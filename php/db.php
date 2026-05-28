<?php
// aqui hacemos la conexion a la base de datos con PDO
// los demas php hacen require_once 'db.php' para usar $pdo y no repetir esto en todos lados

$host = 'localhost';
$data = 'restaurante';
$user = 'root';
$pass = '';
$chrs = 'utf8mb4';

// datos para conectar
$attr = "mysql:host=$host;dbname=$data;charset=$chrs";
$opts = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // que de error si pasa algo
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,          // los resultados como array asociativo
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // intentamos conectar
    $pdo = new PDO($attr, $user, $pass, $opts);
} catch (PDOException $e) {
    // si falla mostramos el error y paramos
    die(json_encode(['error' => $e->getMessage()]));
}
