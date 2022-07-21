

KaToolsV1.modal.define("ka-insert-modal", function($tpl, $args, $resolve, $reject){

    let scope = {

    }
    $tpl.render(scope);

}, KaToolsV1.html`

<div class="modal-header">
    <h5 class="modal-title">Element einfügen</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
</div>
<div ka.if="content !== null" class="modal-content" ka.htmlcontent="content">

</div>
<div class="modal-footer">
    <button class="btn"  >Einfügen</button>
</div>

`)
