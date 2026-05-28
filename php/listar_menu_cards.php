<?php
// saca los menus para las cards de la pagina publica de menus
// devuelve id, nombre, temporada, imagen y precio (si existe la columna en la BD)

require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

try {
    // primero probamos pidiendo Precio, por si esta la columna en la base de datos
    $stmt = $pdo->query("
        SELECT Id_Menu, Nombre, Temporada, Imagen_Ruta, Precio
        FROM menu
        ORDER BY Id_Menu
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // si peta es que la columna Precio no existe todavia, lo hacemos sin ella
    $stmt = $pdo->query("
        SELECT Id_Menu, Nombre, Temporada, Imagen_Ruta
        FROM menu
        ORDER BY Id_Menu
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // metemos Precio = null para que el javascript no se rompa
    foreach ($rows as &$r) {
        if (!array_key_exists('Precio', $r)) {
            $r['Precio'] = null;
        }
    }
    unset($r);
}

echo json_encode($rows);
