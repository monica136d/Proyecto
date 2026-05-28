<?php
// borra un usuario desde el panel del admin
// pero solo si no tiene reservas, asi no dejamos datos sueltos en la base de datos

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$id = (int)($_POST['id_usuario'] ?? 0);

if ($id < 1) {
    echo json_encode(['ok' => false, 'msg' => 'id_usuario inválido']);
    exit();
}

try {
    // contamos cuantas reservas tiene este usuario
    $chk = $pdo->prepare(
        "SELECT COUNT(*) FROM reserva WHERE Id_Usuario = :id"
    );
    $chk->execute([':id' => $id]);
    $total = (int)$chk->fetchColumn();

    // si tiene aunque sea una reserva no lo dejamos borrar
    if ($total > 0) {
        echo json_encode([
            'ok'  => false,
            'msg' => 'No se puede eliminar: el usuario tiene ' . $total . ' reserva(s) asociada(s)',
        ]);
        exit();
    }

    // si no tiene reservas, lo borramos
    $del = $pdo->prepare("DELETE FROM usuario WHERE Id_Usuario = :id");
    $del->execute([':id' => $id]);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    echo json_encode(['ok' => false, 'msg' => 'Error de servidor']);
}
