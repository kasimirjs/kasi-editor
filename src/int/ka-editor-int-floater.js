
class KaEditorElementFloater extends KaEditorElement {

    async connected() {
        let scope = {
            position: {
                top: 200,
                left: 200,
                height: 100,
                width: 100
            }
        }
        this.$tpl.render(scope);

    }
}


KaToolsV1.ce_define("ka-editor-int-floater",  KaEditorElementFloater , KaToolsV1.html`
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">
<link href="/ka-editor-shadow.css" rel="stylesheet">
<style>
.floater {

    position: absolute;
    z-index: 999999;

}

.floater .backdrop {
    border: 1px solid black;
    background-color: #0a58ca;
    opacity: 0.1;
    position: absolute;
    width: inherit;
    height: inherit;

}

</style>
<div ka.style="position" class="floater">
    <div class="backdrop"></div>
    <div>Im floating</div>
</div>


`, {shadowDom: true});
