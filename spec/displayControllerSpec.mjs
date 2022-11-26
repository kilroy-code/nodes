import Registerable from "../registerable.mjs";
import DisplayController from "../displayController.mjs";

describe('DisplayController', function () {
  describe('example', function () {
    class ControllerForSomeExternalDisplayMechanism extends DisplayController {
      display() { return new SomeExternalDisplayMechanism(this.constructor.name); }
      update() { this.display.update(`name: ${this.model.name}`); return super.__update(); }
      resetDisplay() { SomeExternalDisplayMechanism.remove(this.display); return super.resetDisplay(); }
    }
    class MyDisplayer extends ControllerForSomeExternalDisplayMechanism {
    }
    class MyEditor extends ControllerForSomeExternalDisplayMechanism {
      display(self) { // Attach a handler to the display object.
        let display = super.__display(self);
        display.changeName = string => this.model.name = string;
        return display;
      }
    }
    class MyNode extends Registerable {
      name() { return ''; }
      readOnlyView() { return new MyDisplayer({model: this}); }
      editorView() { return new MyEditor({model: this}); }
    }
    class SomeExternalDisplayMechanism {
      static getContent() { return this.output.map(item => `${item.tag}: ${item.content}`).join(', '); }
      static remove(item) { this.output = this.output.filter(displayed => displayed !== item); }
      constructor(tag) {
        this.tag = tag;
        this.constructor.output.push(this);
      }
      update(content) { return this.content = content; }
      getContent() { return this.content; }
    }
    [MyNode, ControllerForSomeExternalDisplayMechanism, MyDisplayer, MyEditor].forEach(c => c.register({nonRules: ['constructor', 'resetDisplay']}));

    beforeEach(function () {
      SomeExternalDisplayMechanism.output = [];
    });      
    it('display the same underlying data in all views', function (done) {
      let name = 'foo',
          node = new MyNode({name: name}),
          label = `name: ${node.name}`;
      node.readOnlyView;
      node.editorView;
      setTimeout(_ => {
        expect(SomeExternalDisplayMechanism.getContent()).toBe(`MyDisplayer: ${label}, MyEditor: ${label}`);
        expect(DisplayController.for(node.readOnlyView.display)).toBe(node.readOnlyView);
        expect(DisplayController.for(node.editorView.display)).toBe(node.editorView);                  
        done();
      });
    });
    it('a method invoked in one view changes what is shown in all.', function (done) {
      let name = 'foo',
          node = new MyNode({name: name});
      node.readOnlyView;
      setTimeout(_ => {
        node.editorView.display.changeName('bar');
        setTimeout(_ => {
          let label = `name: ${node.name}`;
          node.readOnlyView;
          expect(SomeExternalDisplayMechanism.getContent()).toBe(`MyDisplayer: ${label}, MyEditor: ${label}`);
          done();
        });
      });
    });
    it('a change of model changes what is shown.', function (done) {
      let name = 'foo',
          node = new MyNode({name: name}),
          editor = node.editorView,
          otherNode = new MyNode({name: 'baz'});
      editor.adopt(otherNode);
      setTimeout(_ => {
        let label = `name: ${otherNode.name}`;
        expect(SomeExternalDisplayMechanism.getContent()).toBe(`MyEditor: ${label}`);
        expect(DisplayController.for(editor.display)).toBe(editor);
        done();
      });
    });
  });
});
