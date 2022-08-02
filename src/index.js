import {KaEditorConfig} from "./core/ka-editor-config";
import {ActionConfig} from "./core/action/action-config";
import {TemplateConfig} from "./core/template/template-config";
import "./core/editor-main-loop";

import "./components/ka-editor-sidebar";
import "./components/ka-editor-sidebar-item";
import "./components/ka-editor";
import "./components/hover-indicator";

import "./actions/clone-action"
import "./actions/edit-action"

const KaEditor = {
    config: KaEditorConfig,
    ActionConfig: ActionConfig,
    TemplateConfig: TemplateConfig
}

window.KaEditor = KaEditor;

export default KaEditor;
