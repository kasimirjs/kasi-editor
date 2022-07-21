<?php

namespace KasimirJS\Editor;

class KasimirLoader
{


    const MAP = [
        "core/ka-editor-element.js",

        "el/ka-editor.js",
        "el/ka-editor-container.js",

        "modal/ka-insert-modal.js",

        "int/ka-editor-int-floater.js",
        "int/ka-editor-int-indicator.js",

        "int/indicator-actions.js",
    ];


    public static function Load()
    {
        $output = "/* KasimirJS EMBED - documentation: https://kasimirjs.infracamp.org - Author: Matthias Leuffen <m@tth.es>*/\n";
        foreach (self::MAP as $value) {
            $output .= "\n/* from $value */\n";
            $output .= file_get_contents(__DIR__ . "/" . $value);
        }
        return $output;
    }

}
