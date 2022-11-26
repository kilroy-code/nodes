import Tree from "../tree.mjs";

describe('Tree', function () {
  class TreeWithRulesDependentOnChildren extends Tree {
    childrenFoo() {
      return this.children.map(child => child.foo);
    }
  }
  TreeWithRulesDependentOnChildren.register();
  describe('children', function () {
    it('defaults to empty array.', async function () {
      let children = await new Tree().children;
      expect(Array.isArray(children)).toBeTruthy();
      expect(children.length).toBe(0);
    });

    it('tracks changes to parts.', async function () {
      let parent = new TreeWithRulesDependentOnChildren();
      expect(await parent.childrenFoo).toEqual([]);

      parent.parts = [new Tree({foo: 1})];
      expect(await parent.childrenFoo).toEqual([1]);

      parent.parts = [new Tree({foo: 2})];
      expect(await parent.childrenFoo).toEqual([2]);      
    });
  });
  describe('parent', function () {
    it('defaults to null.', function () {
      expect(new Tree().parent).toBe(null);
    });
    it('is set when adding a child, but only after children are referenced.', function () {
      let parent = new Tree();
      let child = new Tree();
      parent.parts = [child];
      expect(new Tree().parent).toBe(null); // before referencing children
      parent.children;
      expect(child.parent).toBe(parent); // after
    });
    it('is set to null when removing a child, but only after children are referenced.', function () {
      let parent = new Tree();
      let child = new Tree();
      parent.parts = [child];
      parent.children;
      expect(child.parent).toBe(parent);
      parent.parts = [];
      expect(child.parent).toBe(parent); // before demanding children again
      parent.children;
      expect(child.parent).toBe(null); // after
    });
    it('tracks dependencies.', function () {
      class ParentFooTree extends Tree {
        parentFoo() { return this.parent && this.parent.foo; }
      }
      ParentFooTree.register();
      let child = new ParentFooTree(),
          parent = new Tree({foo: 'p'});
      expect(parent.children.length).toBe(0);
      expect(child.parentFoo).toBe(null); // before adding to parent      
      parent.parts = [child];
      expect(parent.children.length).toBe(1);      
      expect(child.parentFoo).toBe('p'); // after adding, rule that depends on parent is updated
      parent.parts = [];
      expect(parent.children.length).toBe(0);      
      expect(child.parentFoo).toBe(null); // and updated again after removing
    });
    it('does not maintain children relationships when directly messed with outside of addChild.', async function () {
      let parent = new Tree(),
          child = new Tree();
      await parent.children;
      child.parent = parent;
      expect(child.parent).toBe(parent);
      expect(parent.addedParts).not.toContain(child);
      expect(parent.children).not.toContain(child);      
    });
  });
  describe('root', function () {
    it('is the ancestral parent.', function () {
      let branch = new Array(3).fill().map(_ => new Tree());
      // 0 < 1 < 2
      branch[1].parts = [branch[2]];
      branch[0].parts = [branch[1]];
      branch.forEach(b => b.children)
      branch.forEach(b => expect(b.root).toBe(branch[0]));
      // 1 < 2 < 0
      branch[2].parts = [branch[0]]; // We can be circular, as long as we don't demand root! Beware eager rules.
      branch[0].parts = [];
      branch.forEach(b => b.children)
      branch.forEach(b => expect(b.root).toBe(branch[1]));
    });
  });
  describe('parts', function () {
    it('default to an empty list.', function () {
      expect(new Tree().parts).toEqual([]);
    });
    it('will update children and their parent when changed.', function () {
      let parent = new Tree({foo: 'p'}),
          child = new Tree({foo: 'c'});
      expect(parent.children.length).toBe(0);
      expect(child.parent).toBe(null);
      // parts is normally a rule based on other rules as shown in next spec, but if it is assigned directly...
      parent.parts = [child];
      expect(parent.children).toEqual([child]);
      expect(child.parent).toBe(parent);
    });
    it('does not add the same child to children multiple times.', function () {
      let parent = new TreeWithRulesDependentOnChildren(),
          child1 = new Tree({foo: 'c1'}),
          child2 = new Tree({foo: 'c2'});
      parent.parts = [child1, child2, child1];
      expect(parent.childrenFoo).toEqual(['c1', 'c2']); // Not [c1, c2, c1]
    });
    it('can be specified as a rule, and appear in children with parent assigned.', function () {
      let sFoo = 42, aFoo = 17, bFoo = 33;
      class FooStructure extends Tree {
        a() { return new Tree({foo: aFoo}); }
        b() { return new Tree({foo: bFoo}); }
        parts() {
          return [this.a, this.b];
        }
      }
      FooStructure.register();
      let structure = new FooStructure({foo: sFoo});
      expect(structure.foo).toBe(sFoo);
      expect(structure.a.foo).toBe(aFoo);
      expect(structure.b.foo).toBe(bFoo);

      let children = structure.children;
      expect(children).toContain(structure.a);
      expect(children).toContain(structure.b);
      expect(structure.a.parent).toBe(structure);
      expect(structure.b.parent).toBe(structure);
    });
    describe('is a rulfied list', function () {
      it('and so tracks assignment to elements, updating children and their parent.', function () {
        let parent = new TreeWithRulesDependentOnChildren(),
            child1 = new Tree({foo: 1}),
            child2 = new Tree({foo: 2});
        parent.parts[0] = child1;
        expect(parent.childrenFoo).toEqual([1]);
        expect(child1.parent).toBe(parent);
        parent.parts[0] = child2;
        expect(parent.childrenFoo).toEqual([2]);
        expect(child2.parent).toBe(parent);
        expect(child1.parent).toBe(null);         
      });
      it('and so tracks assignment to elements, updating children and their parent.', function () {
        let parent = new TreeWithRulesDependentOnChildren(),
            child1 = new Tree({foo: 1}),
            child2 = new Tree({foo: 2});
        parent.parts.push(child1);
        parent.parts.push(child2);        
        expect(parent.childrenFoo).toEqual([1, 2]);
        expect(child1.parent).toBe(parent);
        expect(child2.parent).toBe(parent);        
        parent.parts.shift();
        expect(parent.childrenFoo).toEqual([2]);
        expect(child1.parent).toBe(null);
        expect(child2.parent).toBe(parent);        
      });
      it('can be extended, returning the same possibly modified list, without causing unnecessary changes to dependencies.', function () {
        // Very subtle, but an important case.
        let firedCount = 0;
        class ExampleView extends Tree {
          model() {
            return null;
          }
          parts() {
            let base = super.__parts(),
                existingViews = base.slice(),
                desiredModels = this.model ? this.model.children : [];
            desiredModels.forEach((desiredModel, index) => {
              let existingView = existingViews[index];
              if (existingView && existingView.model === desiredModel) return; // don't touch a thing.
              let found = existingViews.find(existingView => existingView.model === desiredModel),
                  view = found || new ExampleView({model: desiredModel});
              base[index] = view;
            });
            base.length = desiredModels.length;
            return base;
          }
          firstChildModelFoo() {
            firedCount++;
            let first = this.parts[0];
            return first && first.model.foo; // Note that we reference only the element, not length!
          }
        }
        ExampleView.register();
        let model = new Tree(),
            c1 = new Tree({foo: 17}),
            c2 = new Tree(),
            view = new ExampleView({model});
        expect(view.children).toEqual([]);
        model.parts.push(c1);
        model.parts.push(c2);
        expect(view.children[0].model).toBe(c1);
        expect(view.children[1].model).toBe(c2);
        expect(view.firstChildModelFoo).toBe(17);
        expect(firedCount).toBe(1);
        let firstViewChild = view.children[0];
        model.parts.pop();
        expect(view.children[0].model).toBe(c1); // still.
        expect(view.children[0]).toBe(firstViewChild); // still. (nice!)
        expect(view.children.length).toBe(1);
        expect(view.firstChildModelFoo).toBe(17);
        // Alas, firstChildModel requires view.parts => model.children
        // and model.children requires a lot of stuff from model.parts, some of which have changed.
        // We do NOT currently confine map dependencies to the individal elements that depend on them.
        // E.g., to have view.parts[1] depend only on model.children[1], and not on model.children.length or model.children[2].
        expect(firedCount).toBe(2);
      });
    });
    describe('conveniences', function () {
      // I'm not sure that these are useful in production, but they're nice in development and tests.
      describe('parts', function () {
        it('can be specified at construction, and they will be the initial parts.', function () {
          let child1 = new Tree(),
              child2 = new Tree(),
              parent = new Tree({parts: [child1, child2]});
          expect(parent.children).toEqual([child1, child2]);
          expect(child1.parent).toBe(parent);
          expect(child2.parent).toBe(parent);
        });
      });
      describe('parent', function () {
        it('can be specified at construction, and the specified object will have the Tree added.', function () {
          let parent = new Tree(),
              child = new Tree({parent});
          expect(child.parent).toBe(null); // until we reference parent.children.
          expect(parent.children).toEqual([child]);
          expect(child.parent).toBe(parent);
        });
        it('can be specified when parent already has children.', function () {
          let child1 = new Tree(),
              child2 = new Tree(),
              parent = new Tree({parts: [child1, child2]}),
              child3 = new Tree({parent});
          expect(parent.children).toEqual([child1, child2, child3]);
          expect(child1.parent).toBe(parent);
          expect(child2.parent).toBe(parent);
          expect(child3.parent).toBe(parent);          
        });
      });
      describe('specs', function () {
        it('can be specified at construction, and they will be the initial parts.', async function () {
          let parent = new Tree({specs: [{type: 'Tree', foo: 1}, {type: 'Tree', foo: 2}]}),
              children = await parent.children;
          expect(children.map(c => c.foo)).toEqual([1, 2]);
          expect(children[0].parent).toBe(parent);
          expect(children[1].parent).toBe(parent);
        });
        it('will use the same class if type is not given.', async function () {
          class TreeSubclass extends Tree { }
          class OtherSubclass extends Tree {}
          [TreeSubclass, OtherSubclass].forEach(constructor => constructor.register());
          let root = new TreeSubclass({specs: [{foo: 1}, {foor: 2}, {foo: 3, type: 'OtherSubclass'}]});
          await root.children;
          expect(root.children[0]).toBeInstanceOf(TreeSubclass);
          expect(root.children[1]).toBeInstanceOf(TreeSubclass);
          expect(root.children[2]).toBeInstanceOf(OtherSubclass);
        });
      });
    });
  });
});
