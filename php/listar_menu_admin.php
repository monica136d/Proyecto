<?php
// devuelve la lista de menus para la tabla del admin
// junta cada menu con sus platos y vinos usando JOIN
// con GROUP_CONCAT metemos todas las descripciones en una sola celda separadas por |

require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$stmt = $pdo->query("
    SELECT
        m.Id_Menu,
        m.Nombre,
        m.Temporada,
        m.Imagen_Ruta,
        MIN(dm.Id_Plato) AS Id_Plato,
        GROUP_CONCAT(DISTINCT p.Descripcion ORDER BY p.Id_Plato SEPARATOR ' | ') AS Plato_Descripcion,
        MIN(dm.Id_Vino)  AS Id_Vino,
        GROUP_CONCAT(DISTINCT v.Nombre      ORDER BY v.Id_Vino  SEPARATOR ' | ') AS Vino_Nombre
    FROM menu m
    LEFT JOIN detalle_menu dm ON dm.Id_Menu = m.Id_Menu
    LEFT JOIN plato        p  ON p.Id_Plato = dm.Id_Plato
    LEFT JOIN vino         v  ON v.Id_Vino  = dm.Id_Vino
    GROUP BY m.Id_Menu, m.Nombre, m.Temporada, m.Imagen_Ruta
    ORDER BY m.Id_Menu
");

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
