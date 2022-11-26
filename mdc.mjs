import { DomElement } from './dom.mjs';
const MDCRipple = mdc.ripple.MDCRipple;
const MDCIconButtonToggle = mdc.iconButton.MDCIconButtonToggle;
const MDCCheckbox = mdc.checkbox.MDCCheckbox;
const MDCRadio = mdc.radio.MDCRadio;
const MDCFormField = mdc.formField.MDCFormField;
const MDCSwitch = mdc.switchControl.MDCSwitch;
const MDCTextField = mdc.textField.MDCTextField;
const MDCLinearProgress = mdc.linearProgress.MDCLinearProgress;
const MDCCircularProgress = mdc.circularProgress.MDCCircularProgress;
const MDCMenu = mdc.menu.MDCMenu;
const MDCList = mdc.list.MDCList;
const MDCTopAppBar = mdc.topAppBar.MDCTopAppBar;

// FIXME:
// Drag/drop. Keep components atomic but allow drilldown. Target highlighting and grids.
// Standardize setting of model rules from input components. Do they relate to a specific rule? Build/use property editor.
//   get/set text from/for model. (Default to instance name? class name?)
//   get/set on/off values for switch/checkbox/radio.
// Standardize the use of icons. Maybe text and icon inputs?
// Standardize the use of label.
// Standardize the use of before/after for label and icons. (Do they ever happen together?)
// Standardize variant. There's also some that have a subvariant within SOME of the variations.
// Some of these assign labelContainerDisplay and/or childContainerDisplay within display rule,
//   while others declare individual rules. Which is better?
// aria
// behavior - e.g., all the do/don't usage patterns for FABs.

// TBD: How shall we support css classes that specify ripple colors: https://material.io/develop/web/supporting/ripple#css-classes
export class MDCComponent extends DomElement { // FIXME: material-design-component component???!
}

export class Typography extends MDCComponent {
  text() {
    if (this.model) return this.model.text;
    // Create a reasonable default that works for our mumbleN subclasses, but also
    // for subclasses of those that do not end with N.
    const name = this.constructor.name;
    return name[0] + name.slice(1).split(/(?=[0-9A-Z])/g).join(' ');
  }
  elementFormatting() {
    return 'mdc-typography--' + this.constructor.name.replace('Text', '').toLowerCase();
  }
}
export class Headline1 extends Typography { elementTag() { return 'h1'; } }
export class Headline2 extends Typography { elementTag() { return 'h2'; } }
export class Headline3 extends Typography { elementTag() { return 'h3'; } }
export class Headline4 extends Typography { elementTag() { return 'h4'; } }
export class Headline5 extends Typography { elementTag() { return 'h5'; } }
export class Headline6 extends Typography { elementTag() { return 'h6'; } }
export class Subtitle1 extends Typography { elementTag() { return 'h6'; } }
export class Subtitle2 extends Typography { elementTag() { return 'h6'; } }
export class Body1 extends Typography { elementTag() { return 'p'; } }
export class Body2 extends Typography { elementTag() { return 'p'; } }
class WrappedTypography extends Typography {
  elementTag() {
    return 'span';
  }
  display() {
    let label = this.labelDisplay = super.__display(),
        wrapper = this.createDisplay('div');
    wrapper.append(label );
    return wrapper;
  }
}
export class ButtonText extends WrappedTypography { }
export class CaptionText extends WrappedTypography { }
export class OverlineText extends WrappedTypography { }

export class LinearProgress extends MDCComponent {
  label() {
    return "Progress Bar";
  }
  value() {
    return 0.33;
  }
  buffer() {
    return 0.67;
  }
  display() {
    let display = this.createDisplay('div', 'mdc-linear-progress', {
      role: "progressbar",
      'aria-label': this.label,
      'aria-valuemin': 0, // hardcoded in MDC
      'aria-valuemax': 1, // hardcoded in MDC
    }),
        primary = this.createDisplay('div', 'mdc-linear-progress__bar mdc-linear-progress__primary-bar'),
        secondary  = this.createDisplay('div', 'mdc-linear-progress__bar mdc-linear-progress__secondary-bar'),
        buffer = this.createDisplay('div', 'mdc-linear-progress__buffer'),
        bufferBar = this.createDisplay('div', 'mdc-linear-progress__buffer-bar'),
        bufferDots = this.createDisplay('div', 'mdc-linear-progress__buffer-dots'),
        primaryInner = this.createDisplay('span', 'mdc-linear-progress__bar-inner'),
        secondaryInner = this.createDisplay('span', 'mdc-linear-progress__bar-inner');
    buffer.append(bufferBar, bufferDots);
    primary.append(primaryInner);
    secondary.append(secondaryInner);
    display.append(buffer, primary, secondary);
    this.linearProgress = new MDCLinearProgress(display);
    this.linearProgress.progress = this.value; // fixme: follow value
    this.linearProgress.buffer = this.buffer;  // fixme: folow value
    return display;
  }
}
export class CircularProgress extends MDCComponent {
  label() {
    return "Progress Bar";
  }
  value() {
    return 0.33;
  }
  display() {
    const makeSvg = (classname) => {
      return this.createDisplay('svg', classname, {
        viewBox: "0 0 48 48",
        xmlns: "http://www.w3.org/2000/svg"
      });
    }
    const makeCircle = (classname, strokeWidth, offset) => {
      return this.createDisplay('circle', classname, {
        cx: "24", cy: "24", r: "18", 'stroke-width': strokeWidth, 'stroke-dasharray': "113.097", 'stroke-dashoffset': offset});
    }
    const makeRing = (classname, strokeWidth) => {
      let div = this.createDisplay('div', classname),
          svg = makeSvg('mdc-circular-progress__indeterminate-circle-graphic'),
          circle = makeCircle('', strokeWidth, 56.549);
      svg.append(circle);
      div.append(svg);
      return div;
    }
    let display = this.createDisplay('div', 'mdc-circular-progress', {
      style: "width:48px;height:48px;",
      role: "progressbar",
      'aria-label': this.label,
      'aria-valuemin': 0, // hardcoded in MDC
      'aria-valuemax': 1, // hardcoded in MDC
    }),
        determinate = this.createDisplay('div', 'mdc-circular-progress__determinate-container'),
        indeterminate  = this.createDisplay('div', 'mdc-circular-progress__indeterminate-container'),
        graphic = makeSvg('mdc-circular-progress__determinate-circle-graphic'),
        track = this.createDisplay('circle', 'mdc-circular-progress__determinate-track', {cx: "24", cy: "24", r: "18", 'stroke-width':"4"}),
        circle = makeCircle('mdc-circular-progress__determinate-circle', 4, 113.097),
        spinner = this.createDisplay('div', 'mdc-circular-progress__spinner-layer'),
        left = makeRing('mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left', 4),
        patch = makeRing('mdc-circular-progress__gap-patch', 3.2),
        right = makeRing('mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right', 4);
    graphic.append(track, circle);
    determinate.append(graphic);
    spinner.append(left, patch, right);
    indeterminate.append(spinner);
    display.append(determinate, indeterminate);
    this.circularProgress = new MDCCircularProgress(display);
    this.circularProgress.progress = this.value; // fixme: follow value
    //this.circularProgress.determinate = true;
    //this.circularProgress.open();
    return display;
  }
}

// FIXME: For touch devices, buttons, fabs, checkboxes should
//   wrap in <div class="mdc-touch-target-wrapper">
//   add mdc-button--touch to button
//   add a <span class="mdc-button__touch"></span> child of button (some have this as a div?)
export class Button extends MDCComponent {
  variant() {
    return 'text'; // text, outlined, raised, unelevated.  (Some doc describes uses the word "contained" to describe 'raised'.)
  }
  icon() {
    return '';
  }
  iconIsLeading() {
    return true;
  }
  disabled() {
    return false;
  }
  // TODO: there's also a mdc-button--dense class that can be requested
  elementFormatting() {
    let button = 'mdc-button', classes = [button];
    if (this.variant !== 'text') classes.push(`${button}--${this.variant}`);
    if (this.icon) classes.push(`${button}--icon-${this.iconIsLeading ? 'leading' : 'trailing'}`);
    return classes.join(' ');
  }
  text() {
    if (this.model) return this.model.text; // FIXME: Isn't that more likely to be the name of an action to take on model when pressed?
    return this.constructor.name;
  }
  display() {
    // fixme: disabled
    const icon = (leading) => {
      if (!this.icon) return '';
      if (leading !== this.iconIsLeading) return '';
      return this.createDisplay('i', "material-icons mdc-button__icon", {'aria-hidden': true}, this.icon);
    }
    let display = this.createDisplay('button', this.elementFormatting, {
      disabled: this.disabled,
      ontouchstart: ""  // For mobile safari. See https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari/33681490#33681490
    }),
        ripple = this.createDisplay('span', 'mdc-button__ripple'),
        beforeIcon = icon(true),
        label = this.labelDisplay = this.createDisplay('span', 'mdc-button__label'),
        afterIcon = icon(false);
    display.append(ripple, beforeIcon, label, afterIcon);
    this.ripple = new MDCRipple(display);
    return display;
  }
}

export class IconButton extends MDCComponent {
  text() {
    return 'favorite'; // The text must be specified, and is the name of the material icon.
  }
  display() {
    let display = this.createDisplay('button', 'mdc-icon-button material-icons'),
        // TBD: Should this be 'div'? Unlike buttons, that's what the Material Design docs show.
        ripple = this.createDisplay('span',  'mdc-icon-button__ripple');
    display.append(ripple);
    this.ripple = new MDCRipple(display);
    this.ripple.unbounded = true;
    return display;
  }
}

export class IconButtonToggle extends MDCComponent {
  labelOn() { return "Remove from favorites"; }
  labelOff() { return "Add to favorites"; }
  iconOn() { return 'favorite'; }
  iconOff() { return this.iconOn + '_border'; }
  display() {
    let display = this.createDisplay('button', 'mdc-icon-button', {
      'aria-label': this.labelOff,
      'data-aria-label-off': this.labelOff,
      'data-aria-label-on': this.labelOn
    }),
        ripple = this.createDisplay('div', 'mdc-icon-button__ripple'),
        on = this.createDisplay('i', 'material-icons mdc-icon-button__icon mdc-icon-button__icon--on', {}, this.iconOn),
        off = this.createDisplay('i', 'material-icons mdc-icon-button__icon', {}, this.iconOff);
    display.append(ripple, on, off);
    this.iconToggle = new MDCIconButtonToggle(display);
    return display;
  }
}

export class FAB extends MDCComponent {
  icon() { return 'favorite'; }
  display() {
    let display = this.createDisplay('button', 'mdc-fab', {'aria-label': this.icon}),
        ripple = this.createDisplay('div', 'mdc-fab__ripple'),
        label = this.createDisplay('span', 'mdc-fab__icon material-icons');
    label.textContent = this.icon;
    display.append(ripple, label);
    this.ripple = new MDCRipple(display);
    return display;
  }
}

export class Checkbox extends MDCComponent {
  label() {
    if (this.model) return this.model.text;
    return 'checkbox';
  }
  display() {
    let display = this.createDisplay('div', 'mdc-checkbox'),
        input = this.createDisplay('input', 'mdc-checkbox__native-control', {
          type: 'checkbox',
          id: this.instanceTag
        }),
        ripple = this.createDisplay('div', 'mdc-checkbox__ripple'),
        background = this.createDisplay('div', 'mdc-checkbox__background'),
        checkmark = this.createDisplay('svg', 'mdc-checkbox__checkmark', {viewBox: '0 0 24 24'}),
        checkmarkPath = this.createDisplay('path', 'mdc-checkbox__checkmark-path', {
          fill: "none",
          d: "M1.73,12.91 8.1,19.28 22.79,4.59"
        }),
        mixedmark = this.createDisplay('div', 'mdc-checkbox__mixedmark');
    checkmark.append(checkmarkPath);
    background.append(checkmark, mixedmark);
    display.append(input, background, ripple);
    this.checkbox = new MDCCheckbox(display);
    if (!this.label) return display;
    let wrapper = this.createDisplay('div', 'mdc-form-field'),
        label = this.createDisplay('label', '', {for: this.instanceTag});
    label.textContent = this.label;
    wrapper.append(display, label);
    this.formField = new MDCFormField(wrapper);
    this.formField.input = this.checkbox;
    return wrapper;
  }
}

export class Radio extends MDCComponent {
  label() {
    if (this.model) return this.model.text;
    return 'radio';
  }
  name() {
    if (this.model) return this.model.name;
    return 'radio';
  }
  display() {
    let display = this.createDisplay('div', 'mdc-radio'),
        input = this.createDisplay('input', 'mdc-radio__native-control', {
          type: 'radio',
          id: this.instanceTag,
          name: this.name
        }),
        ripple = this.createDisplay('div', 'mdc-radio__ripple'),
        background = this.createDisplay('div', 'mdc-radio__background'),
        off = this.createDisplay('div', 'mdc-radio__outer-circle'),
        on = this.createDisplay('div', 'mdc-radio__inner-circle');
    background.append(off, on);
    display.append(input, background, ripple);
    this.radio = new MDCRadio(display);
    if (!this.label) return display;
    let wrapper = this.createDisplay('div', 'mdc-form-field'),
        label = this.createDisplay('label', '', {for: this.instanceTag});
    label.textContent = this.label;
    wrapper.append(display, label);
    this.formField = new MDCFormField(wrapper);
    this.formField.input = this.radio;
    return wrapper;
  }
}

export class Switch extends MDCComponent {
  text() {
    if (this.model) return this.model.text;
    return "off/on";
  }
  display() {
    let display = this.createDisplay('div', 'mdc-switch'),
        track = this.createDisplay('div', 'mdc-switch__track'),
        underlay = this.createDisplay('div', 'mdc-switch__thumb-underlay mdc-switch__ripple'),
        thumb = this.createDisplay('div', 'mdc-switch__thumb'),
        input = this.createDisplay('input', 'mdc-switch__native-control', {
          type: 'checkbox',
          id: this.instanceTag,
          role: "switch",
          'aria-checked': "false" // a string!
        });
    thumb.append(input);
    underlay.append(thumb);
    display.append(track, underlay);
    this.switch = new MDCSwitch(display);
    if (!this.text) return display;
    let wrapper = this.createDisplay('span'),
        label = this.labelDisplay = this.createDisplay('label', '', {for: this.instanceTag});
    wrapper.append(display, " ", label);
    return wrapper;
  }
}

export class TextField extends MDCComponent {
  text() {
    if (this.model) return this.model.text;
    return "Hint text";
  }
  display() {
    let display = this.createDisplay('label', 'mdc-text-field mdc-text-field--filled'),
        label = this.labelDisplay = this.createDisplay('span', 'mdc-floating-label', {id: this.instanceTag}, this.text);
    display.append(this.createDisplay('span', 'mdc-text-field__ripple'),
                   label,
                   this.createDisplay('input', 'mdc-text-field__input', {
                     type: 'text',
                     'aria-labelledby': this.instanceTag
                   }),
                   this.createDisplay('span', 'mdc-line-ripple'));
    this.textField = new MDCTextField(display);
    return display;
  }
}

export class AppBar extends MDCComponent {
  display() {
    let display = this.createDisplay('header', 'mdc-top-app-bar'),
        title = this.createDisplay('section', 'mdc-top-app-bar__section mdc-top-app-bar__section--align-start'),
        container = this.childContainerDisplay = this.createDisplay('section', 'mdc-top-app-bar__section mdc-top-app-bar__section--align-end', {role: 'toolbar'}),
        // FIXME: instantiate a Button here
        nav = this.createDisplay('button', 'material-icons mdc-top-app-bar__navigation-icon mdc-icon-button'),
        label = this.labelDisplay = this.createDisplay('span', 'mdc-top-app-bar__title');
    nav.textContent = 'menu';
    title.append(nav, label);
    display.append(title, container);
    this.appBar = new MDCTopAppBar(display);
    return display;
  }
  // FIXME: the next sibling should be a <main class="mdc-top-app-bar--fixed-adjust"> containing the app content
}
export class Grid extends MDCComponent {
  mirrors() {
    if (this.model) return super.__mirrors();
    return Array.from({length: 3}, (_, i) => new Body1({text: `Grid Cell ${i}`}));
  }
  display() {
    let display = this.createDisplay('div', 'mdc-layout-grid'),
        inner = this.childContainerDisplay = this.createDisplay('div', 'mdc-layout-grid__inner');
    display.append(inner);
    return display;
  }
  childFormatting() {
    return 'mdc-layout-grid__cell';
  }
}
// A list element can contain other lists. The general case is
// <li>some text
//   <ul>
//     <li>first item<ul></ul></li>
//     <li>second item<ul></ul>></li>
//   </ul>
// </li>
// But if there's no text at this item's level, then we ommit the outer <li> and just use the <ul>,
// and if there are no parts, we also ommit the empty <ul>.
//
// This particular implementation works for two different things, and maybe that's not a good idea:
// 1. A list/item, such that it creates a list item when there's text, and a list group as needed.
// 2. An MDC list, which is really a listbox, i.e., allows a user to select from the choices.
export class List extends MDCComponent {
  text() {
    return this.model ? this.model.text : '';
  }
  elementTag() {
    return this.text ? 'li' : 'ul';
  }
  childContainerTag() {
    return (this.text && this.mirrors.length) ? 'ul' : '';
  }
  groupFormatting() { // The className for a 'ul' element, if any, on which li style will be built.
    return (this.parent && this.parent.groupFormatting) || '';
  }
  elementFormatting() {
    if (!this.groupFormatting) return '';
    if (!this.text) return this.groupFormatting;
    return this.groupFormatting + '-item';
  }
  labelDisplay() {
    if (!this.groupFormatting) return this.display;
    let label = this.createDisplay('span', this.elementFormatting + '__text');
    this.display.append(label);
    return label;
  }
  display() {
    let display = super.__display();
    if (this.text && this.groupFormatting) {
      let ripple = this.createDisplay('span', 'mdc-list-item__ripple');
      display.append(ripple);
      this.ripple = new MDCRipple(display);
    }
    this.list = new MDCList(display);
    return display;
  }
  mirrorClass() {
    return this.constructor;
  }
}
export class Menu extends MDCComponent {
  elementTag() {
    return 'div';
  }
  elementFormatting() {
    return 'mdc-menu mdc-menu-surface';
  }
  update() {
    let update = super.__update(),
        menu = this.menu = new MDCMenu(this.display);
    return update;
  }
}

const exports = {
  MDCComponent,

  Typography, Headline1, Headline2, Headline3, Headline4, Headline5, Headline6, Subtitle1, Subtitle2, Body1, Body2,
  WrappedTypography, ButtonText, CaptionText, OverlineText,

  Button, IconButton, IconButtonToggle, FAB,
  Checkbox, Radio, Switch,
  TextField,
  LinearProgress, CircularProgress,

  AppBar, 
  Grid, List, Menu
};
export default exports;
Object.values(exports).forEach(c => c.register({
  nonRules: ['constructor', 'createDisplay', 'attachTo'],
}));
