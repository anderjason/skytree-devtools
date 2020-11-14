import { ArrayActivator, Actor } from "skytree";
import { ElementStyle, KeyboardShortcut } from "@anderjason/web";
import { TreeViewItem } from "./TreeViewItem";
import {
  Observable,
  ObservableArray,
  ObservableSet,
} from "@anderjason/observable";

export interface ListManagerProps {
  parentElement: HTMLElement;
}

export class ListManager extends Actor<ListManagerProps> {
  static ignoredSet = new Set<string>();

  static ignoreActor<T extends Actor>(actor: T): T {
    this.ignoredSet.add(actor.actorId);
    return actor;
  }

  onActivate() {
    ListManager.ignoreActor(this);

    const selectedActor = Observable.ofEmpty<Actor>(Observable.isStrictEqual);

    const wrapper = this.addActor(
      ListManager.ignoreActor(
        WrapperStyle.toManagedElement({
          tagName: "div",
          parentElement: this.props.parentElement,
        })
      )
    );

    const menu = this.addActor(
      ListManager.ignoreActor(
        MenuStyle.toManagedElement({
          tagName: "div",
          parentElement: wrapper.element,
        })
      )
    );

    const list = this.addActor(
      ListManager.ignoreActor(
        ListStyle.toManagedElement({
          tagName: "div",
          parentElement: wrapper.element,
        })
      )
    );

    const sidebar = this.addActor(
      ListManager.ignoreActor(
        SidebarStyle.toManagedElement({
          tagName: "div",
          parentElement: wrapper.element,
        })
      )
    );

    this.cancelOnDeactivate(
      selectedActor.didChange.subscribe((actor) => {
        sidebar.element.innerHTML = "";

        if (
          actor == null ||
          actor.props == null ||
          typeof actor.props !== "object"
        ) {
          return;
        }

        const title = document.createElement("h3");
        title.innerHTML = actor.actorId;
        sidebar.element.appendChild(title);

        Object.keys(actor.props).forEach((key) => {
          const div = document.createElement("div");
          let value = actor.props[key];
          if (Observable.isObservable(value)) {
            value = value.value;
          } else if (ObservableArray.isObservableArray(value)) {
            value = "[]";
          } else if (ObservableSet.isObservableSet(value)) {
            value = "Set";
          }

          div.innerHTML = `${key}: ${value}`;
          sidebar.element.appendChild(div);
        });
      }, true)
    );

    const rootObjects = ObservableArray.ofEmpty<Actor>();
    this.cancelOnDeactivate(
      Actor.rootSet.didChange.subscribe((actors) => {
        console.log("root set", actors);

        const filteredActors = actors.filter(
          (actor) => !ListManager.ignoredSet.has(actor.actorId)
        );

        rootObjects.sync(filteredActors);
      }, true)
    );

    this.addActor(
      new ArrayActivator({
        input: rootObjects,
        fn: (actor, index, currentObject) => {
          return ListManager.ignoreActor(
            new TreeViewItem({
              parentElement: list.element,
              actor,
              selectedActor,
            })
          );
        },
      })
    );

    const isExpanded = Observable.givenValue(false, Observable.isStrictEqual);

    this.addActor(
      KeyboardShortcut.givenKeyCombination(["Alt", "S"], () => {
        isExpanded.setValue(!isExpanded.value);
      })
    );

    this.cancelOnDeactivate(
      isExpanded.didChange.subscribe((v) => {
        menu.setModifier("isVisible", v);
        list.setModifier("isVisible", v);
        sidebar.setModifier("isVisible", v);
      }, true)
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  elementDescription: "ListManager",
  css: `
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    overflow: hidden;
    z-index: 2000;
    pointer-events: none;
  `,
});

const transition = "0.5s cubic-bezier(.03,.9,.5,.98)";

const ListStyle = ElementStyle.givenDefinition({
  elementDescription: "List",
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
    overflow-y: auto;
    pointer-events: auto;
  `,
  modifiers: {
    isVisible: `
      transform: none;
    `,
  },
});

const SidebarStyle = ElementStyle.givenDefinition({
  elementDescription: "Sidebar",
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
    font-family: monospace;
    white-space: pre-wrap;
    overflow: hidden;
    color: #FFF;
    padding: 20px;
    line-height: 1.5;
  `,
  modifiers: {
    isVisible: `
      transform: none;
    `,
  },
});

const MenuStyle = ElementStyle.givenDefinition({
  elementDescription: "Menu",
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
