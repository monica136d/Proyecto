<?php
// devuelve una lista simple de menus (id y nombre)
// se usa para los selects de la pagina de reservar (uno por cada comensal)

require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$stmt = $pdo->query('SELECT Id_Menu, Nombre FROM menu ORDER BY Id_Menu');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));