"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListManager = void 0;
const skytree_1 = require("skytree");
const web_1 = require("@anderjason/web");
const TreeViewItem_1 = require("./TreeViewItem");
const observable_1 = require("@anderjason/observable");
class ListManager extends skytree_1.Actor {
    static ignoreActor(actor) {
        this.ignoredSet.add(actor.actorId);
        return actor;
    }
    onActivate() {
        ListManager.ignoreActor(this);
        const wrapper = this.addActor(ListManager.ignoreActor(WrapperStyle.toManagedElement({
            tagName: "div",
            parentElement: this.props.parentElement,
        })));
        const menu = this.addActor(ListManager.ignoreActor(MenuStyle.toManagedElement({
            tagName: "div",
            parentElement: wrapper.element,
        })));
        const list = this.addActor(ListManager.ignoreActor(ListStyle.toManagedElement({
            tagName: "div",
            parentElement: wrapper.element,
        })));
        const sidebar = this.addActor(ListManager.ignoreActor(SidebarStyle.toManagedElement({
            tagName: "div",
            parentElement: wrapper.element,
        })));
        const rootObjects = observable_1.ObservableArray.ofEmpty();
        this.cancelOnDeactivate(skytree_1.Actor.rootSet.didChange.subscribe((actors) => {
            const filteredActors = actors.filter((actor) => !ListManager.ignoredSet.has(actor.actorId));
            console.log(filteredActors);
            rootObjects.sync(filteredActors);
        }, true));
        this.addActor(new skytree_1.ArrayActivator({
            input: rootObjects,
            fn: (actor, index, currentObject) => {
                return ListManager.ignoreActor(new TreeViewItem_1.TreeViewItem({
                    parentElement: list.element,
                    actor,
                }));
            },
        }));
        const isExpanded = observable_1.Observable.givenValue(false, observable_1.Observable.isStrictEqual);
        this.addActor(web_1.KeyboardShortcut.givenKeyCombination(["Alt", "S"], () => {
            isExpanded.setValue(!isExpanded.value);
        }));
        this.cancelOnDeactivate(isExpanded.didChange.subscribe((v) => {
            menu.setModifier("isVisible", v);
            list.setModifier("isVisible", v);
            sidebar.setModifier("isVisible", v);
        }, true));
    }
}
exports.ListManager = ListManager;
ListManager.ignoredSet = new Set();
const WrapperStyle = web_1.ElementStyle.givenDefinition({
    css: `
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    overflow: hidden;
    z-index: 2000;
  `,
});
const transition = "0.5s cubic-bezier(.03,.9,.5,.98)";
const ListStyle = web_1.ElementStyle.givenDefinition({
    css: `
    background: #22272BFC;
    bottom: 0;
    font-size: 14px;
    padding: 12px;
    position: absolute;
    right: 30vw;
    top: 0;
    width: 67vw;
    z-index: 101;
    box-sizing: border-box;
    transform: translate(calc(100% + 30vw), 0);
    transition: ${transition} transform;
  `,
    modifiers: {
        isVisible: `
      transform: none;
    `,
    },
});
const SidebarStyle = web_1.ElementStyle.givenDefinition({
    css: `
    background: #374148FC;
    top: 0;
    bottom: 0;
    position: absolute;
    right: 0;
    width: 30vw;
    box-sizing: border-box;
    z-index: 102;
    transform: translate(100%, 0);
    transition: ${transition} transform;
  `,
    modifiers: {
        isVisible: `
      transform: none;
    `,
    },
});
const MenuStyle = web_1.ElementStyle.givenDefinition({
    css: `
    background: #16191CFC;
    top: 0;
    bottom: 0;
    position: absolute;
    right: 97vw;
    width: 4vw;
    box-sizing: border-box;
    z-index: 100;
    transform: translate(calc(100% + 97vw), 0);
    transition: ${transition} transform;
  `,
    modifiers: {
        isVisible: `
      transform: none;
    `,
    },
});
//# sourceMappingURL=index.js.map