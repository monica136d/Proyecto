<?php
// recibe el formulario de reservar y guarda la reserva en la base de datos
// solo deja reservar si esta logueado el usuario
// valida fecha, hora, comensales (1 a 9), mesa, dia (jue-dom) y un menu por comensal
// si hace falta junta dos mesas para que quepan todos

session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'db.php';
require_once 'registro_actividad.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // si no esta logueado lo mandamos al login
    if (!isset($_SESSION['usuario_id'])) {
        header('Location: ../html/login.html');
        exit();
    }

    // datos del formulario
    $fecha           = $_POST['fecha']       ?? '';
    $hora            = $_POST['hora']        ?? '';
    $comensales      = (int)($_POST['comensales']  ?? 0);
    $idMesaElegida   = (int)($_POST['id_mesa']     ?? 0);
    $id_usuario_real = $_SESSION['usuario_id'];
    $observaciones   = trim($_POST['observaciones'] ?? '');

    // miramos los datos minimos
    if ($fecha === '' || $hora === '' || $comensales < 1 || $comensales > 9 || $idMesaElegida < 1) {
        header('Location: ../html/reservar.html?error=datos');
        exit();
    }

    // miramos que sea de jueves a domingo (1=lun ... 7=dom)
    $fechaObj = DateTime::createFromFormat('Y-m-d', $fecha);
    $diaSemana = $fechaObj ? (int)$fechaObj->format('N') : 0;
    if (!in_array($diaSemana, [4, 5, 6, 7], true)) {
        header('Location: ../html/reservar.html?error=dia');
        exit();
    }

    // los menus elegidos (uno por cada comensal)
    $menus = $_POST['menus'] ?? [];
    if (!is_array($menus)) {
        $menus = [];
    }

    // si no hay un menu por persona da error
    if (count($menus) !== $comensales) {
        header('Location: ../html/reservar.html?error=menus');
        exit();
    }

    // el primer menu lo guardamos tambien en la tabla reserva como menu principal
    $primer_menu = (int)($menus[0] ?? 1);

    try {
        $pdo->beginTransaction();

        // miramos que la mesa elegida existe
        $stmtMesa = $pdo->prepare(
            "SELECT Id_Mesa, Capacidad FROM mesa WHERE Id_Mesa = :id_mesa"
        );
        $stmtMesa->execute([':id_mesa' => $idMesaElegida]);
        $mesa = $stmtMesa->fetch();

        if (!$mesa) {
            $pdo->rollBack();
            header('Location: ../html/reservar.html?error=mesa_invalida');
            exit();
        }

        // sacamos las mesas libres de ese dia y hora
        $stmtLibres = $pdo->prepare(
            "SELECT m.Id_Mesa, m.Numero_Mesa, m.Capacidad
             FROM mesa m
             WHERE m.Id_Mesa NOT IN (
                SELECT rm.Id_Mesa
                FROM reserva r
                INNER JOIN reserva_mesa rm ON rm.Id_Reserva = r.Id_Reserva
                WHERE r.Fecha = :fecha
                  AND r.Hora  = :hora
                  AND r.Estado != 'cancelada'
             )
             ORDER BY m.Capacidad DESC, m.Numero_Mesa ASC"
        );
        $stmtLibres->execute([':fecha' => $fecha, ':hora' => $hora]);
        $mesasLibres = $stmtLibres->fetchAll(PDO::FETCH_ASSOC);

        // buscamos que la mesa elegida siga libre
        $mesaPrincipal = null;
        foreach ($mesasLibres as $m) {
            if ((int)$m['Id_Mesa'] === $idMesaElegida) {
                $mesaPrincipal = $m;
                break;
            }
        }
        if (!$mesaPrincipal) {
            $pdo->rollBack();
            header('Location: ../html/reservar.html?error=ocupada');
            exit();
        }

        // si no caben todos en una mesa buscamos otra para juntarlas
        $idMesaSecundaria = null;
        $capacidadTotal = (int)$mesaPrincipal['Capacidad'];

        if ($capacidadTotal < $comensales) {
            foreach ($mesasLibres as $m2) {
                $id2 = (int)$m2['Id_Mesa'];
                if ($id2 === (int)$mesaPrincipal['Id_Mesa']) continue;
                if ($capacidadTotal + (int)$m2['Capacidad'] >= $comensales) {
                    $idMesaSecundaria = $id2;
                    $capacidadTotal += (int)$m2['Capacidad'];
                    break;
                }
            }
        }

        // si ni juntando dos mesas caben damos error
        if ($capacidadTotal < $comensales) {
            $pdo->rollBack();
            header('Location: ../html/reservar.html?error=sin_capacidad');
            exit();
        }

        // metemos la reserva con la mesa principal
        $sql_insertar = "INSERT INTO reserva
                            (Id_Usuario, Id_Mesa, Id_Menu, Fecha, Hora, Num_Personas, Estado, Observaciones)
                         VALUES
                            (:id_usuario, :id_mesa, :id_menu, :fecha, :hora, :comensales, 'confirmada', :observaciones)";

        $stmt_insert = $pdo->prepare($sql_insertar);
        $stmt_insert->execute([
            ':id_usuario'    => $id_usuario_real,
            ':id_mesa'       => $idMesaElegida,
            ':id_menu'       => $primer_menu,
            ':fecha'         => $fecha,
            ':hora'          => $hora,
            ':comensales'    => $comensales,
            ':observaciones' => $observaciones,
        ]);

        $id_reserva = (int)$pdo->lastInsertId();

        // metemos las mesas que se usan en esta reserva (1 o 2)
        $insMesaReserva = $pdo->prepare(
            'INSERT INTO reserva_mesa (Id_Reserva, Id_Mesa) VALUES (?, ?)'
        );
        $insMesaReserva->execute([$id_reserva, (int)$mesaPrincipal['Id_Mesa']]);
        if ($idMesaSecundaria !== null) {
            $insMesaReserva->execute([$id_reserva, (int)$idMesaSecundaria]);
        }

        // guardamos un menu por cada comensal en reserva_menu
        $insMenu = $pdo->prepare(
            'INSERT INTO reserva_menu (Id_Reserva, Id_Menu, Cantidad) VALUES (?, ?, 1)'
        );
        foreach ($menus as $id_menu) {
            $id_menu = (int)$id_menu;
            if ($id_menu < 1) continue;
            $insMenu->execute([$id_reserva, $id_menu]);
        }

        // sacamos nombre de usuario y numero de mesa para el aviso de actividad
        $stmtNombre = $pdo->prepare("SELECT Nombre FROM usuario WHERE Id_Usuario = :id");
        $stmtNombre->execute([':id' => $id_usuario_real]);
        $nombreUsuario = $stmtNombre->fetchColumn() ?: 'Usuario';

        $stmtNumMesa = $pdo->prepare("SELECT Numero_Mesa FROM mesa WHERE Id_Mesa = :id");
        $stmtNumMesa->execute([':id' => $idMesaElegida]);
        $numMesa = $stmtNumMesa->fetchColumn() ?: $idMesaElegida;

        $txtMesas = 'Mesa ' . $numMesa;
        if ($idMesaSecundaria !== null) {
            $stmtNumMesa2 = $pdo->prepare("SELECT Numero_Mesa FROM mesa WHERE Id_Mesa = :id");
            $stmtNumMesa2->execute([':id' => $idMesaSecundaria]);
            $numMesa2 = $stmtNumMesa2->fetchColumn() ?: $idMesaSecundaria;
            $txtMesas .= ' + Mesa ' . $numMesa2;
        }

        registrarActividad($pdo, 'reserva_creada',
            $nombreUsuario . ' reservó ' . $txtMesas .
            ' para el ' . $fecha . ' a las ' . $hora);

        $pdo->commit();

        // mandamos a reservar.html con un ok para que aparezca el mensaje
        $qs = 'reserva=ok&comensales=' . urlencode((string)$comensales);
        $qs .= '&mesas=' . urlencode($txtMesas);
        header('Location: ../html/reservar.html?' . $qs);
        exit();

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        // si la mesa ya esta reservada (codigo 23000) avisamos con alert
        if ($e->getCode() == 23000) {
            echo "<script>alert('Error: Esa mesa ya ha sido reservada.'); window.history.back();</script>";
        } else {
            echo "Error crítico: " . $e->getMessage();
        }
    }
}
?>
