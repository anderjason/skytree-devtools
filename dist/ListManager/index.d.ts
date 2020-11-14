import { Actor } from "skytree";
export interface ListManagerProps {
    parentElement: HTMLElement;
}
export declare class ListManager extends Actor<ListManagerProps> {
    static ignoredSet: Set<string>;
    static ignoreActor<T extends Actor>(actor: T): T;
    onActivate(): void;
}
