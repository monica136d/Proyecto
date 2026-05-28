<?php
// devuelve los datos de UN menu para la pagina de detalle
// le pasamos el id por GET (?id=...) y devuelve el menu y sus pases (platos + vinos)

require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$idMenu = (int)($_GET['id'] ?? 0);
if ($idMenu < 1) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'msg' => 'ID de menú inválido']);
    exit();
}

try {
    // pedimos los datos del menu, intentando con Precio por si esta esa columna
    try {
        $stmtMenu = $pdo->prepare("
            SELECT Id_Menu, Nombre, Temporada, Imagen_Ruta, Precio
            FROM menu
            WHERE Id_Menu = ?
            LIMIT 1
        ");
        $stmtMenu->execute([$idMenu]);
        $menu = $stmtMenu->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        // si Precio no existe, lo pedimos sin ella y lo dejamos en null
        $stmtMenu = $pdo->prepare("
            SELECT Id_Menu, Nombre, Temporada, Imagen_Ruta
            FROM menu
            WHERE Id_Menu = ?
            LIMIT 1
        ");
        $stmtMenu->execute([$idMenu]);
        $menu = $stmtMenu->fetch(PDO::FETCH_ASSOC);
        if ($menu && !array_key_exists('Precio', $menu)) {
            $menu['Precio'] = null;
        }
    }

    // si no existe el menu devolvemos 404
    if (!$menu) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'msg' => 'Menú no encontrado']);
        exit();
    }

    // sacamos los pases (cada plato con su vino)
    $stmtPases = $pdo->prepare("
        SELECT
            p.Id_Plato,
            p.Tipo,
            p.Descripcion AS Plato_Descripcion,
            v.Id_Vino,
            v.Nombre AS Vino_Nombre,
            v.Tipo_Vino
        FROM detalle_menu dm
        LEFT JOIN plato p ON p.Id_Plato = dm.Id_Plato
        LEFT JOIN vino v ON v.Id_Vino = dm.Id_Vino
        WHERE dm.Id_Menu = ?
        ORDER BY p.Id_Plato, v.Id_Vino
    ");
    $stmtPases->execute([$idMenu]);
    $pases = $stmtPases->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok' => true,
        'menu' => $menu,
        'pases' => $pases
    ]);
} catch (Exception $e) {
    // si peta el servidor devolvemos 500
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => 'Error interno']);
}
