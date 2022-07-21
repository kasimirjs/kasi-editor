<?php

namespace KasimirJS\Elements;

use KasimirJS\Editor\KasimirLoader;

require __DIR__ . "/../vendor/autoload.php";

header("Content-Type: text/javascript");

$data = KasimirLoader::Load();
if ($data !== file_get_contents(__DIR__ . "/kasimir-editor.js"))
    file_put_contents(__DIR__ . "/kasimir-editor.js", $data);

