<?php

namespace KasimirJS\Editor;

class KasimirLoader
{


    const MAP = [


        "rfc/ka-position-element-next-to.js",
        "rfc/ka-create-element.js",
        "rfc/ka-get-parent-element.js",
        "rfc/ka-widget.js",

        "rfc-elem/ka-context-menu.js",
        "rfc-elem/ka-context-menu-action.js",


        "core/action-config.js",
        "core/action-manager.js",
        "core/ka-editor-element.js",
        "core/facet.js",
        "core/template-manager.js",

        "core/template-config.js",
        "core/ka-editor-ui-facet.js",
        "core/tools.js",

        "core/config.js",

        "actions/edit-action.js",
        "actions/clone-action.js",
        "actions/append-child-action.js",

        "el/ka-editor.js",
        "el/ka-editor-container.js",
        "el/ka-context-menu.js",

        "modal/ka-insert-modal.js",

        "int/ka-editor-int-floater.js",
        "int/ka-editor-int-indicator.js",
        "int/ka-editor-int-hover-indicator.js",
        "int/ka-editor-sidebar.js",
        "int/ka-editor-sidebar-item.js",



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
