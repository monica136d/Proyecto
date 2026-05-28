<?php
// cerrar sesion del usuario
// borramos la sesion y mandamos al inicio
session_start();
session_destroy();
header("Location: ../index.html");
exit();
?>
