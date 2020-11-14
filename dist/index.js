"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const skytree_1 = require("skytree");
const ListManager_1 = require("./ListManager");
window.actorGivenId = (actorId) => {
    return skytree_1.Actor.activeSet.toArray().find((actor) => actor.actorId === actorId);
};
window.Actor = skytree_1.Actor;
new ListManager_1.ListManager({
    parentElement: document.body,
}).activate();
//# sourceMappingURL=index.js.map