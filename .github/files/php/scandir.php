<?php
function scanAllDir($dir) {
    $result = [];
    foreach(scandir($dir) as $filename) {
        if ($filename[0] === '.') continue;
        $filePath = $dir . '/' . $filename;
        if (is_dir($filePath)) {
            foreach (scanAllDir($filePath) as $childFilename) {
                $result[] = $filename . '/' . $childFilename;
            }
        } else {
            $result[] = $filename;
        }
    }
    return $result;
}

function scanFolder($dir) {
    $result = [];
    foreach(scandir($dir) as $filename) {
        if ($filename[0] === '.') continue;
        $filePath = $dir . '/' . $filename;
        if ($filename == "php") continue;
        if (is_dir($filePath)) $result[] = $filename;
        
    }
    return $result;
}

function dirToArray($dir) {
    $res = [];
    $cdir = scanAllDir($dir);
    foreach ($cdir as $key => $value) {
        $hash = hash_file('sha1', $dir . "/" . $value);
        $size = filesize($dir . "/" . $value);
        $path = str_replace("$dir/", "", $dir . "/" . $value);
            
        $url_req = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
        $url = "http://$_SERVER[HTTP_HOST]$url_req$dir/$path";
        $res[] = array("url" => $url, "size" => $size, "hash" => $hash, "path" => $path);     
    }
    return str_replace("\\", "", json_encode($res)); 
}
?>