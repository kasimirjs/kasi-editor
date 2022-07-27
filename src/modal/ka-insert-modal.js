

KaToolsV1.modal.define("ka-insert-modal", function($tpl, $args, $resolve, $reject){
    let f = new KaEditorFacet();

    let scope = {
        element: $args.element,
        templates: f.getAllowedChildTemplates($args.element),
        $resolve
    }
    $tpl.render(scope);

    // language=html
}, KaToolsV1.html`

<div class="modal-header">
    <h5 class="modal-title">Element einfügen</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
</div>
<div class="modal-content">
    <ul class="list-group">
        <li class="list-group-item" ka.for="let curTpl of templates" ><a href="javascript:void(0)" ka.on.click="$resolve(curTpl)" ka.htmlContent="(new KaEditorUiFacet(curTpl.content.firstElementChild)).getNaviNameHtml()"></a></li>
    </ul>

</div>
<div class="modal-footer">
    <button class="btn"  >Einfügen</button>
</div>

`)
