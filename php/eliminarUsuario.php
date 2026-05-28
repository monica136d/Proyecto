<?php
// borra un usuario desde el panel del admin
// si el usuario tiene reservas, las borramos primero y luego al usuario
// todo dentro de una transaccion para que o se hace todo o nada

session_start();
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$id = (int)($_POST['id_usuario'] ?? 0);

if ($id < 1) {
    echo json_encode(['ok' => false, 'msg' => 'id_usuario inválido']);
    exit();
}

try {
    $pdo->beginTransaction();

    // primero borramos las reservas del usuario
    // las FK con ON DELETE CASCADE limpian solas reserva_mesa y reserva_menu
    $delReservas = $pdo->prepare("DELETE FROM reserva WHERE Id_Usuario = :id");
    $delReservas->execute([':id' => $id]);

    // ahora ya podemos borrar el usuario (no quedan reservas que lo referencien)
    $delUsuario = $pdo->prepare("DELETE FROM usuario WHERE Id_Usuario = :id");
    $delUsuario->execute([':id' => $id]);

    // si no se borro nada es que el id no existia
    if ($delUsuario->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode(['ok' => false, 'msg' => 'El usuario no existe']);
        exit();
    }

    $pdo->commit();
    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['ok' => false, 'msg' => 'Error de servidor']);
}
