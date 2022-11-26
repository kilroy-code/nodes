import Registerable from "../registerable.mjs";

describe("Registerable", function () {
  class Simple extends Registerable { }
  beforeAll(function () {
    Simple.register();
  });
  describe("constructor", function () {
    it("has no required arguments.", function () {
      expect(new Registerable()).toBeInstanceOf(Registerable);
    });
    it("takes named arguments and assigns each value directly (unless otherwise handled specially).", function () {
      let options = {a: 1, b: "two", c: ["c"], d: {dee: "dee"}},
          instance = new Registerable(options);
      expect(instance).toBeInstanceOf(Registerable);
      for (let property in options) {
        expect(instance[property]).toBe(options[property]);
      }
    });
    it("defines type, even if not specified as argument to constructor.", function () {
      expect(new Registerable().type).toBe("Registerable");
    });
    it("defines text and title as rules.", function () { // Debatable whether we need these in Registerable, but used in toString().
      let text1 = 'foo',
          text2 = 'bar',
          instance = new Registerable({text: text1});
      expect(instance.text).toBe(text1);
      expect(instance.title).toBe(text1);
      instance.text = text2;
      expect(instance.text).toBe(text2);
      expect(instance.title).toBe(text2);
    });
    it("defines toString().", function () {
      expect(new Registerable().toString()).toBeTruthy();
      let simple = new Simple({title: 'foo'});
      expect(simple.toString()).toContain('Simple');
      expect(simple.toString()).toContain('foo');
    });
  });
  describe("static register()", function () {
    describe("allows a class to be registered", function () {
      it("so that the type can be specified as a string.", function () {
        expect(new Registerable({type: "Simple"})).toBeInstanceOf(Simple);
      });
      it('also allows type to be the constructor itself.', function () {
        expect(new Registerable({type: Simple})).toBeInstanceOf(Simple);
      });
      it("defines each specified value.", function () {
        let options = {type: "Simple", a: 1, b: "two", c: ["c"], d: {dee: "dee"}},
            instance = new Registerable(options);
        expect(instance).toBeInstanceOf(Registerable);
        for (let property in options) {
          expect(instance[property]).toBe(options[property]);  // Including type!
        }
      });
    });
  });
  describe("static create() (just like new, but always a promise)", function () {
    it("has no required arguments.", async function () {
      let promise = Registerable.create();
      expect(promise).toBeInstanceOf(Promise);
      expect(await promise).toBeInstanceOf(Registerable);
    });
    it("takes named arguments and assigns each value directly (unless otherwise handled specially, such as type).", async function () {
      let options = {a: 1, b: "two", c: ["c"], d: {dee: "dee"}, type: "Simple"},
          promise = Registerable.create(options);
      expect(promise).toBeInstanceOf(Promise); 
      let instance = await promise;
      expect(instance).toBeInstanceOf(Simple);
      for (let property in options) {
        expect(instance[property]).toBe(options[property]);
      }
    });
  });
  // TODO: tests for collectProperties, combinedProperties, registrationOptions
});
