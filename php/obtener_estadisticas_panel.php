<?php
// devuelve los totales para las tarjetas de arriba del panel del admin
// son tres COUNT muy simples: cuantos menus, reservas y usuarios hay

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

// contamos cada tabla
$menus    = (int) $pdo->query('SELECT COUNT(*) FROM menu')->fetchColumn();
$reservas = (int) $pdo->query('SELECT COUNT(*) FROM reserva')->fetchColumn();
$usuarios = (int) $pdo->query('SELECT COUNT(*) FROM usuario')->fetchColumn();

echo json_encode([
    'menus'    => $menus,
    'reservas' => $reservas,
    'usuarios' => $usuarios,
]);
