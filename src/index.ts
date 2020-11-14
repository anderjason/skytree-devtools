import { Actor } from "skytree";
import { ListManager } from "./ListManager";

(window as any).actorGivenId = (actorId: string): Actor => {
  return Actor.activeSet.toArray().find((actor) => actor.actorId === actorId);
};

(window as any).Actor = Actor;

new ListManager({
  parentElement: document.body,
}).activate();
