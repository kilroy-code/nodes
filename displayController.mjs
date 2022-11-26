import Tree from "./tree.mjs";

// Executes display during construction, and then update, which is eager.
export default class DisplayController extends Tree {
  model() { return null; }
  display() { return ''; } // The thing that is actually displayed, such as a DOM elemeht or THREE Object3D.
  update() {
    let display = this.display;
    if (display) this.constructor.map.set(display, this);
    return this.children;
  }

  constructor(options) {
    super(options);
    this.display;
    Promise.resolve().then(_ => this.update);
  }

  // Event delegation is important part of being tinkerable. But since the user will be
  // interacting with a display object rather than this instance, a handler will need to
  // be able to find the ki1r0y instance that corresponds to the display.
  static for(displayInstance) {
    return this.map.get(displayInstance);
  }
  
  // FIXME: Can't this be done by assigning the model?
  adopt(model) { this.resetDisplay(); this.model = model; return model; }
  resetDisplay() { let old = this.display; this.display = undefined; return old; }
}
DisplayController.map = new WeakMap();

DisplayController.register({
  ownEagerProperties: ['update'],
  nonRules: ['constructor', 'resetDisplay', 'adopt']
});
