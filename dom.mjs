import DisplayController from "./displayController.mjs";
import {matchModels} from "./tree.mjs"; // fixme: probably belongs elswhere

export class DomElement extends DisplayController {
  elementTag() { return this.constructor.name; } // document.createElement will lowercase
  elementFormatting() { return ''; }
  // TBD: It is worthwile to add elementFormatting in update, so that a change to elementFormatting doesn't reset display?
  display() { return this.createDisplay(this.elementTag, this.elementFormatting); }

  labelDisplay() { return this.display; }

  childContainerTag() { return ''; }
  childFormatting() { return ''; }
  childContainerDisplay() {
    let elementTag = this.childContainerTag;
    if (!elementTag) return this.display;
    let element = this.createDisplay(elementTag);
    this.display.append(element);
    return element;
  }
  instanceTag() { return 'T' + DomElement.instanceTagSequenceNumber++; } // Must be unique on page
  events() { return {}; } // fixme: reconsider how to do this
  // FIXME: get rid of toString and define text() { return this.model ? this.model.text : this.elementTag; }
  toString() { return `[${this.elementTag}]`; }
  createDisplay(tag, initialClass = '', attributes = {}, textContent) {
    let element = document.createElement(tag);
    if (initialClass) element.className = initialClass;
    for (let attribute in attributes) {
      let value = attributes[attribute];
      if ([undefined, false, null].includes(value)) continue;  // but not ""
      if (value === true) value = ""; // because that's the way you specify a boolean attribute.
      element.setAttribute(attribute, value);
    }
    if (textContent) element.textContent = textContent;
    return element;
  }
  children() {
    let viewChildren = super.__children(),
        elementChildren = Array.from(this.childContainerDisplay.children);
    matchModels(viewChildren,
                elementChildren,
                (element, view) => element === view.display,
                (view) => view.display,
                (index, element) => this.childContainerDisplay.insertBefore(element, this.childContainerDisplay.children[index] || null),
                (length) => {
                  //console.log('trim original', elementChildren, 'now', Array.from(this.childContainerDisplay), 'to', length, 'matching', viewChildren);
                  /*
                  for (let index = elementChildren.length - 1; index >= length; index--) {
                    elementChildren[index].remove();
                  }*/
                });
    return viewChildren;
  }
  update() {

    // Update labelDisplay.
    if (this.text && (this.labelDisplay.textContent !== this.text)) {
      // Setting textContent will remove all other child nodes, which not what we want, e.g., if labelDisplay has other bits.
      // Could also set innerText?
      this.labelDisplay.append(this.text);
    }

    // Update display event handlers.
    /*
    if (this.events) {
      for (let name in this.events) {
        this.display[name] = this.events[name].bind(this);
      }
    }*/

    // Update the className/formatting of each child's display.
    let children = super.__update(),
        addedFormatting = this.childFormatting;
    if (addedFormatting) {
      let formatList = addedFormatting.split(' ');
      for (let child of children) {
        let classList = child.display.classList;
        for (let format of formatList) {
          classList.add(format);
        }
      }
    }
    return children;
  }
}
DomElement.instanceTagSequenceNumber = 0;

export class Div extends DomElement { }

export class Document extends DomElement {
  display() { // Resolve when we have a document.body... and not before! This allows scripts to be header OR body.
    return new Promise(resolve => {
      if (document.body) return resolve(document.body);
      window.addEventListener('load', _ => resolve(document.body));
    });
  }
  update() {
    this.display.classList.add('mdc-typography');
    return super.__update();
  }
}

[Document, DomElement, Div].forEach(c => c.register({
  nonRules: ['constructor', 'toString', 'createDisplay'],
  ownEagerProperties: ['update']
}));
