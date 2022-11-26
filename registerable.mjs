import { Rule } from "../rules/index.mjs";

export default class Registerable {
  constructor({type, ...propertiesWithoutType} = {}) {
    // Assigns all the specified properties directly, except for type, which names a registered class.
    if (type && (type !== this.constructor.name)) { // Dispatch to the proper type.
      const constructor = this.constructor.types[type] || (type.prototype && (type.prototype.constructor === type) && type);
      if (!constructor) throw new TypeError(`Cannot construct unregistered type ${type}.`);
      return new constructor(propertiesWithoutType);
    }
    Object.assign(this, propertiesWithoutType); // Subtle: uses setters on this, which will evaluate/track rules.
  }
  type() {
    return this.constructor.name;
  }

  // You'll thank me later. Sure, this isn't strictly necessary, but it is so universally convenient.
  toString() { return `[${this.constructor.name}${this.title ? ' ' : ''}${this.title}]`; }
  text() { return ''; }
  title() { return this.text; } // fixme: shorten at a breakpoint, with elipses.

  static register(options = {}) {
    let {classFunction, name, prototype, ownRuleProperties, eagerProperties} = this.registrationOptions(options);
    prototype._eagerProperties = eagerProperties; // So that subclasses can find it.
    Rule.rulify(prototype, {ruleNames: ownRuleProperties, eagerNames: eagerProperties}); // List all eagerProperties so that any redefinitions are also eager.
    classFunction.types[name] = classFunction;
  }
  static create(properties = {}) { // Promise to collect and construct.
    return this.collectProperties(properties).then(collected => new this(collected));
  }

  // Hooks to be overridden or extended.
  static collectProperties(properties) { // Can be overridden to process properties, as by Persistable.
    return Promise.resolve(properties);
  }

  static combinedProperties(classObject, propertyName, ownProperties) {
    let superclassObject = Object.getPrototypeOf(classObject),
        prototype = superclassObject.prototype;
    return prototype[propertyName].concat(ownProperties);
  }
  static registrationOptions({
    classFunction = this,
    // FIXME: It might be necessary to specify name explicitly when minifying.
    // See https://croquet-dev.slack.com/archives/CKMUHFXUG/p1594826645024400
    // FIXME: consider introducing a reversed-domain-name, or module-basename prefixing.
    name = classFunction.name,
    prototype = classFunction.prototype,
    nonRules = ['constructor'],
    // Not including property names that start with underscore accomplishes two things:
    // 1. It makes it easier to have internal methods that don't accidentally get rulified.
    // 2. It avoids problems with multiple registrations, because the rule objects have underscores.
    // FIXME: make a unit test that confirms both of these.
    ownRuleProperties = Object.getOwnPropertyNames(prototype).filter(name => !nonRules.includes(name) && !name.startsWith('_')),
    ownEagerProperties = [],
    eagerProperties = this.combinedProperties(classFunction, '_eagerProperties', ownEagerProperties),
    ...otherOptions
  } = {}) {
    return {classFunction, name, prototype, nonRules, ownRuleProperties, ownEagerProperties, eagerProperties, ...otherOptions};
  }
}
Registerable.types = {[Registerable]: Registerable};
Rule.rulify(Registerable.prototype, {ruleNames: ['type', 'text', 'title']});
Registerable.prototype._eagerProperties = []; // after rulifing

