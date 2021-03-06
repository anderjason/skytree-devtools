import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { ElementStyle, ManagedElement } from "@anderjason/web";
import { ArrayActivator, Actor } from "skytree";
import { ListManager } from ".";

const rightArrowSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="123.958" height="123.959">
	<path d="M38.217 1.779c-3.8-3.8-10.2-1.1-10.2 4.2v112c0 5.3 6.4 8 10.2 4.2l56-56c2.3-2.301 2.3-6.101 0-8.401l-56-55.999z" fill="#FFF" />
</svg>
`;
let blob = new Blob([rightArrowSvg], { type: "image/svg+xml" });
let rightArrow = URL.createObjectURL(blob);

export interface TreeViewItemProps {
  actor: Actor;
  parentElement: HTMLElement;
  selectedActor: Observable<Actor>;
}

export class TreeViewItem extends Actor<TreeViewItemProps> {
  private _isExpanded = Observable.givenValue(false, Observable.isStrictEqual);
  readonly isExpanded = ReadOnlyObservable.givenObservable(this._isExpanded);

  onActivate() {
    const wrapper = this.addActor(
      ListManager.ignoreActor(
        WrapperStyle.toManagedElement({
          tagName: "div",
          parentElement: this.props.parentElement,
        })
      )
    );

    const label = this.addActor(
      ListManager.ignoreActor(
        LabelStyle.toManagedElement({
          tagName: "div",
          parentElement: wrapper.element,
        })
      )
    );

    this.cancelOnDeactivate(
      label.addManagedEventListener("click", () => {
        this.props.selectedActor.setValue(this.props.actor);

        if (hasChildren.value == true) {
          this._isExpanded.setValue(!this.isExpanded.value);
        }
      })
    );

    const objectIdSpan = this.addActor(
      ListManager.ignoreActor(
        ManagedElement.givenDefinition({
          tagName: "span",
          parentElement: label.element,
        })
      )
    );

    objectIdSpan.element.innerHTML = this.props.actor.managedObjectId;
    objectIdSpan.element.className = "objid";
    this.cancelOnDeactivate(
      objectIdSpan.addManagedEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigator.clipboard.writeText(
          `actorGivenId("${this.props.actor.managedObjectId}")`
        );
      })
    );

    const arrowDiv = this.addActor(
      ListManager.ignoreActor(
        ArrowStyle.toManagedElement({
          tagName: "div",
          parentElement: label.element,
        })
      )
    );

    if (this.props.actor.actorDescription != null) {
      const descriptionSpan = document.createElement("strong");
      descriptionSpan.innerHTML = this.props.actor.actorDescription;
      label.element.appendChild(descriptionSpan);

      const nameSpan = document.createElement("span");
      nameSpan.className = "smallname";
      nameSpan.innerHTML = this.props.actor.constructor.name;
      label.element.appendChild(nameSpan);
    } else {
      const nameSpan = document.createElement("strong");
      nameSpan.innerHTML = this.props.actor.constructor.name;
      label.element.appendChild(nameSpan);
    }

    const childArea = this.addActor(
      ListManager.ignoreActor(
        ChildAreaStyle.toManagedElement({
          tagName: "div",
          parentElement: wrapper.element,
        })
      )
    );

    this.cancelOnDeactivate(
      this.props.selectedActor.didChange.subscribe((selectedActor) => {
        label.setModifier("isSelected", selectedActor === this.props.actor);
      }, true)
    );

    this.cancelOnDeactivate(
      this.isExpanded.didChange.subscribe((isExpanded) => {
        arrowDiv.setModifier("isExpanded", isExpanded);
        childArea.setModifier("isExpanded", isExpanded);
      }, true)
    );

    const hasChildren = Observable.ofEmpty<boolean>(Observable.isStrictEqual);

    this.props.actor.isActive.didChange.subscribe((isTargetActive) => {
      wrapper.setModifier("isTargetActive", isTargetActive);
    }, true);

    this.cancelOnDeactivate(
      this.props.actor.childObjects.didChange.subscribe((c) => {
        hasChildren.setValue(c != null && c.length > 0);
      }, true)
    );

    this.cancelOnDeactivate(
      hasChildren.didChange.subscribe((hc) => {
        label.setModifier("hasChildren", hc);
        arrowDiv.setModifier("isVisible", hc);
      }, true)
    );

    this.addActor(
      ListManager.ignoreActor(
        new ArrayActivator({
          input: this.props.actor.childObjects,
          fn: (childActor, index, currentObject) => {
            return ListManager.ignoreActor(
              new TreeViewItem({
                parentElement: childArea.element,
                actor: childActor,
                selectedActor: this.props.selectedActor,
              })
            );
          },
        })
      )
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  elementDescription: "TreeViewItem",
  css: `
    margin-bottom: 3px;
    opacity: 0.4;
    transition: 0.3s ease opacity;
    will-change: opacity;
    overflow: hidden;
    position: relative;
  `,
  modifiers: {
    isTargetActive: `
      opacity: 1;
    `,
  },
});

const LabelStyle = ElementStyle.givenDefinition({
  elementDescription: "Label",
  css: `
    align-items: center;
    background: #39354C;
    border: 2px solid transparent;
    border-radius: 2px;
    color: white;
    display: flex;
    flex-direction: row;
    letter-spacing: 0.2px;
    margin-bottom: 2px;
    padding: 7px;
    user-select: none;

    strong {
      margin-right: 1rem;
    }

    .smallname {
      font-size: 11px;
      opacity: 0.5;
      padding: 3px 0 0 0;
      display: block;
    }

    .objid {
      cursor: pointer;
      font-family: monospace;
      font-size: 11px;
      margin-right: 1rem;
      opacity: 0.15;
      padding: 3px 5px;

      &:hover {
        background: rgba(0,0,0,0.7);
        border-radius: 4px;
        opacity: 1;
      }
    }

    &:hover {
      .objid {
        opacity: 0.5;
      }
    }

    @media screen and (max-width: 750px) {
      flex-direction: column;
      align-items: flex-start;
      padding-left: 20px;

      .objid {
        padding: 3px 0;
      }
    }
  `,
  modifiers: {
    hasChildren: `
      background: #484265;
      cursor: pointer;
    `,
    isSelected: `
      border-color: #83bce4;
    `,
  },
});

const ChildAreaStyle = ElementStyle.givenDefinition({
  elementDescription: "ChildArea",
  css: `
    display: none;
    padding: 1px 12px;
  `,
  modifiers: {
    isExpanded: `
      display: block;
    `,
  },
});

const ArrowStyle = ElementStyle.givenDefinition({
  elementDescription: "Arrow",
  css: `
    background-image: url(${rightArrow});
    background-position: center;
    background-repeat: no-repeat;
    background-size: 10px 10px;
    height: 20px;
    margin-right: 4px;
    opacity: 0;
    transition: 0.15s ease all;
    width: 20px;
    will-change: opacity, transform;

    @media screen and (max-width: 750px) {
      position: absolute;
      left: 1px;
      top: 24px;
    }
  `,
  modifiers: {
    isExpanded: `
      transform: rotate(90deg);
    `,
    isVisible: `
      opacity: 0.4;
    `,
  },
});
