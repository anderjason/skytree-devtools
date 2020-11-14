import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Actor } from "skytree";
export interface TreeViewItemProps {
    actor: Actor;
    parentElement: HTMLElement;
    selectedActor: Observable<Actor>;
}
export declare class TreeViewItem extends Actor<TreeViewItemProps> {
    private _isExpanded;
    readonly isExpanded: ReadOnlyObservable<boolean>;
    onActivate(): void;
}
