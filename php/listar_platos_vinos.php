<?php
// saca todos los platos y vinos para los desplegables del admin
// se usa al crear o editar un menu para elegir un plato y un vino

require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

// pedimos los platos y los vinos por separado
$platosStmt = $pdo->query('SELECT Id_Plato, Tipo, Descripcion FROM plato ORDER BY Id_Plato');
$vinosStmt  = $pdo->query('SELECT Id_Vino, Nombre, Tipo_Vino FROM vino ORDER BY Id_Vino');

// los devolvemos juntos en un mismo json
echo json_encode([
    'platos' => $platosStmt->fetchAll(PDO::FETCH_ASSOC),
    'vinos'  => $vinosStmt->fetchAll(PDO::FETCH_ASSOC),
]);
