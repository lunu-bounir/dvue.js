'use strict';

class DVue {
  constructor(app) {
    Object.assign(this, app);
    Object.assign(this, app.data);
    // styling
    const style = document.createElement('style');
    style.textContent = `
      .hidden {
        display: none;
      }
    `;
    document.documentElement.appendChild(style);
    // inspect
    [...document.querySelectorAll(app.el)].forEach(e => this.inspect(e));
    [...document.querySelectorAll(app.el)].forEach(e => this.attr(e));
  }
  inspect(parent) {
    for (const child of parent.childNodes) {
      const {nodeType, nodeValue} = child;
      if (nodeType === 3) {
        if (nodeValue.indexOf('{{') !== -1 && nodeValue.indexOf('}}') !== -1) {
          this.dom(child);
        }
      }
      else {
        if (child.nodeType === 1) {
          this.attr(child);
        }
        this.inspect(child);
      }
    }
  }
  eval(string, parent = this) {
    let name = '';
    const value = string.split('.').reduce((p, c) => {
      parent = p;
      if (c.endsWith(']')) {
        const index = Number(/\[(\d+)\]/.exec(c)[1]);
        c = c.split('[')[0];
        name = c;
        return p[c][index];
      }
      else {
        name = c;
        return p[c];
      }
    }, parent);
    return {value, name, parent};
  }
  observe(parent, name, callback) {
    parent._ = parent._ || [];
    if (parent._[name]) {
      parent._[name].push(callback);
    }
    else {
      parent._[name] = [callback];
      let val = parent[name];
      Object.defineProperty(parent, name, {
        get() {
          return val;
        },
        set(value) {
          if (val !== value) {
            val = value;
            parent._[name].forEach(c => c(value));
          }
        }
      });
    }
  }
  dom(node) {
    const re = /{{\s+[^}]+\s+}}/g;
    const matches = node.nodeValue.match(re);
    const sections = node.nodeValue.split(re);
    const fragment = document.createDocumentFragment();
    sections.forEach((section, i) => {
      fragment.appendChild(document.createTextNode(section));
      if (i !== sections.length - 1) {
        const match = matches.shift().slice(2, -2).trim();
        const {value, name, parent} = this.eval(match);
        const node = document.createTextNode(value);
        fragment.appendChild(node);
        // expression
        if (name[0] === '@') { // @expression(trigger,...)
          const expression = name.substr(1).split('(')[0];
          if (name.indexOf('(') !== -1 && name.indexOf(')') !== -1) {
            const triggers = name.split('(')[1].slice(0, -1);
            triggers.split(/\s*,\s*/).forEach(name => {
              this.observe(parent, name, () => {
                node.nodeValue = this.expressions[expression].apply(this);
              });
            });
          }
          node.nodeValue = this.expressions[expression].apply(this);
        }
        else {
          this.observe(parent, name, val => node.nodeValue = val);
        }
      }
    });
    node.parentElement.replaceChild(fragment, node);
  }
  attr(e) {
    for (const attr of e.attributes) {
      // v-bind
      if (attr.name.startsWith('v-bind:')) {
        const key = attr.name.substr(7);
        const {value, name, parent} = this.eval(attr.value);
        this.observe(parent, name, val => e.setAttribute(key, val));
        e.setAttribute(key, value);
      }
      // v-if
      else if (attr.name === 'v-if') {
        const {value, name, parent} = this.eval(attr.value);
        this.observe(parent, name, val => e.classList[val ? 'remove' : 'add']('hidden'));
        e.classList[value ? 'remove' : 'add']('hidden');
      }
      // v-on
      else if (attr.name.startsWith('v-on:')) {
        const key = attr.name.substr(5);
        e.addEventListener(key, e => {
          this.methods[attr.value].call(this, e);
        });
      }
      // v-model
      else if (attr.name === 'v-model') {
        if (e.type === 'text' || e.type === 'search') {
          e.addEventListener('input', () => this[attr.value] = e.value);
        }
        else {
          e.addEventListener('input', () => this[attr.value] = Number(e.value));
        }
        const {value, name, parent} = this.eval(attr.value);
        e.value = value;
        this.observe(parent, name, value => e.value = value);
      }
      // v-for
      else if (attr.name === 'v-for') {
        const [variable, statement] = attr.value.split(/\s+in\s+/);
        const {textContent, parentNode, tagName} = e;

        this.eval(statement).value.forEach((a, i) => {
          const node = document.createElement(tagName);
          node.textContent = textContent.replace(variable, statement + `[${i}]`);
          parentNode.appendChild(node);
        });
        // remove old node to prevent parsing
        e.textContent = '';
        e.remove();
      }
    }
  }
}
