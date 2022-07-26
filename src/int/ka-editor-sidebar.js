


KaToolsV1.ce_define("ka-editor-sidebar",

    async ($tpl, $eventDispatcher) => {
        let facet = new KaEditorFacet();
        let scope = {
            isOpen: true,
            elementTree: facet.getElementTree(document.querySelector("ka-editor")),
            $fn: {
                toggle: () => { scope.isOpen = !scope.isOpen;  $tpl.render() }
            }
        }
        $tpl.render(scope);

        $eventDispatcher.addEventListener("update", () => {
            scope.elementTree = facet.getElementTree(document.querySelector("ka-editor"));
            $tpl.render();
        })
        $eventDispatcher.addEventListener("scrollSideBarIntoView", (e) => {
            scope.$ref.scroll1.scrollTop = e.element.getBoundingClientRect().top;
            console.log("offset top", e.element.getBoundingClientRect())
        })



        scope.$ref.sidebar.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
    },
    // language=html
    KaToolsV1.html`
        <link ka.for="let style of KaEditorConfig.cssStyles" ka.attr.href="style" rel="stylesheet">


        <style>
            .sidebar {
                position: fixed; left: -300px; width: 300px; top:0;bottom: 0;border-right: 1px solid gray;background-color: whitesmoke; z-index: 999999;
                transition: left 300ms ease-in-out;
            }
            .sidebar.open {
                left: 0;
            }
            .sidebar .indicator {
                position: relative;
                left: 300px;
                top: 33%;
                width: 28px;
                height: 28px;
                background-color: black;
                border-top-right-radius: 8px;
                border-bottom-right-radius: 8px;
                box-shadow: black ;
            }
        </style>

        <div ka.ref="'sidebar'" class="sidebar" ka.classlist.open="isOpen">
            <div style="position: absolute; top:0px;height:80px;left:2px;right:2px;overflow: hidden;" ka.htmlcontent="KaEditorConfig.sidebarTopHtml"></div>

            <div ka.ref="'scroll1'" style="position: absolute; top:80px;bottom:80px;left:2px;right:2px;overflow-y: scroll;background-color: white">
                <ka-editor-sidebar-item ka.for="let e of elementTree.children" ka.prop.element="e"></ka-editor-sidebar-item>
            </div>

            <div class="indicator text-light ps-1" ka.on.click="$fn.toggle()" style="cursor: pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
            </div>
        </div>
    `,
    {shadowDom: true}

)
