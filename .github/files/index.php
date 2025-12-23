<?php
header("Content-Type: application/json; charset=UTF-8");
include 'php/scandir.php';

$instance_param = $_GET['instance'] ?? 'null';

if ($instance_param == '/' || $instance_param[0] == '.') {
    echo json_encode([]);
    exit;
} 

if (!file_exists('instances')) {
    echo dirToArray("files");
    exit;
} 

if ($instance_param == 'null') {
    $instances_list = scanFolder("instances");
    $instance = array();
    foreach ($instances_list as $value) {
        if (substr($_SERVER['REQUEST_URI'], -1) == '/') {
            $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], 0, -1);
        }

        $url = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]?instance=$value";
        $instance[$value] = array("name" => $value, "url" => $url);
    }
    
    include 'php/instances.php';
    echo str_replace("\\", "", json_encode($instance));
    exit;
}

echo dirToArray("instances/$instance_param");
?>