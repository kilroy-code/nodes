import { Rule } from "@kilroy-code/rules/index.mjs";
import Registerable from "./registerable.mjs";

/*
Todo: go through save-tree-snapshot.mjs and see what text still makes sense, and what we can't do without
*/

// FIXME: use a key and a WeakMap
// Make existingViews conform to models, changing as little as possible.
// If matcher(existingElement, oneOfTheDesiredModels) is true, that existingElement will be reused.
// Otherwise, maker(oneOfTheDesiredModels) is used to create a new one.
// Either way, insertAt(index, view) is used to change a (new or existing) view position,
// and trimTo(desiredLength) is used to trim off any extras that don't belong.
export function matchModels(desiredModels, existingViews, matcher, maker, insertAt, trimTo) {
  desiredModels.forEach((desiredModel, index) => {
    let existingView = existingViews[index];
    if (existingView && matcher(existingView, desiredModel)) return; // don't touch a thing.
    let found = existingViews.find(existingView => matcher(existingView, desiredModel)),
        view = found || maker(desiredModel);
    insertAt(index, view);
  });
  trimTo(desiredModels.length);
}

export default class Tree extends Registerable {
  // Maintains parent/children properties based on fixedParts and addedParts rules.
  constructor({parent, parts = [], specs = [], ...properties} = {}) {
    super(properties);
    // The instanceLabel makes it easier to trace what a rule requires.
    this._internalChildren = Rule.rulify([], {instanceLabel: `${this.constructor.name}_internalChildren`});
    this._internalMirrors = Rule.rulify([], {instanceLabel: `${this.constructor.name}_internalMirrors`});
    let partsList = this._internalParts = Rule.rulify([], {instanceLabel: `${this.constructor.name}_internalParts`});
    if (parent) {
      parent.parts.push(this);
    }
    for (let part of parts) {
      partsList.push(part);
    }
    for (let spec of specs) {
      partsList.push(this.constructor.create(spec));
    }
  }
  mirrorClass() { // If truthy, should be name of a class that we will instantiate as a child for each child of our model.
    return null;
  }
  mirrors() {
    let base = this._internalMirrors,
        mirrorClass = this.mirrorClass;
    if (mirrorClass && this.model) {
      matchModels(this.model.children, base.slice(),
                  (view, model) => view.model === model,
                  model => new mirrorClass({model}),
                  (index, view) => base[index] = view,
                  (length) => base.length = length
                 );
    }
    return base;
  }
  parts() { // Subclasses typically override or extend with a list of nodes based on, e.g, the model rule.
    // Returning an internal ivar value ensures that even when we are reset and recomputed, we return the same value.

    // Obviously, we're not depending on anything here that would cause us to be reset, but a subclass might
    // have additional references that could cause it to be reset. If the subclass uses super.__parts, it gets
    // access to the previous value (i.e., before the subclass rule recomputes). See unit test
    // 'can be extended, returning the same possibly modified list, without causing unnecessary changes to dependencies.'
    return this._internalParts;
    /*
    // The above is NOT TRUE if there is a model and mirrorClass in the following code:
    let base = this._internalParts,
        mirrorClass = this.mirrorClass;
    if (mirrorClass && this.model) {
      matchModels(this.model.children, base.slice(),
                  (view, model) => view.model === model,
                  model => new mirrorClass({model}),
                  (index, view) => base[index] = view,
                  (length) => base.length = length
                 );
    }
    return base;
    */
  }
  root() { // Convenience rule.
    if (!this.parent) { return this; }
    return this.parent.root;
  }
  parent() { // You can depend on it, but you'll confuse yourself if you assign it.
    return null;
  }
  children() { // A promisable list of all children. Do not assign or override.
    // Not worth it to use matchModels.
    let desired = this.parts.concat(this.mirrors),
        existing = this._internalChildren;
    for (let child of existing) {
      if (!desired.includes(child)) {
        child.parent = null;
        this._internalChildren.splice(existing.indexOf(child), 1);
      }
    }
    for (let child of desired) {
      if (!existing.includes(child)) {
        child.parent = this;
        this._internalChildren.push(child);
      }
    }
    return this._internalChildren;
  }
}
Tree.register();

// To consider:
// Separate out a noteChildAdded and noteChildRemoved method that can be extended by subclasses?
// Create an addChild and removeChild method that pushes to and splices from parts?
// Make things SEEM simpler by having:
// - assignment to children (as a whole) be an error.
// - assignment to any element (or length) of children forward the assignment to parts, instead.
//   But note that we can't make parts completely internal, as rules should override parts, not children.
