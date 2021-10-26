# be-definitive

be-definitive is an attribute-based version of the [d-fine](https://github.com/bahrus/d-fine) custom element.

be-definitive allows us to take some DOM that needs to repeat, and turn it into a web component.

Or DOM that is already repeating (using declarative Shadow DOM), but that needs to be made interactive, via a web component.

Basically, declarative custom elements (once the necessary dependencies are downloaded).

## [Demo](https://codepen.io/bahrus/pen/VwzPwmv)


## Example 1 -- Prerendered live DOM that is repeated

```html
<div be-definitive='{
  "config":{
    "tagName":"hello-world",
    "propDefaults":{
      "place": "Venus",
      "updateTransform":{
        "span": "place"
      }
    },
  }

}'>
  <div>Hello, <span>world</span></div>
</div>
<hello-world place=Mars></hello-world>
```

... generates:

```html
<div>
    <div>Hello, <span>Venus</span></div>
</div>
<hello-world place=Mars>
    #shadow
    <div>
        <div>Hello, <span>Mars</span></div>
    </div>
</hello-world>
```

So the first instance of the pattern displays without a single byte of Javascript being downloaded.  

Subsequent instances take less bandwidth to download, and generate quite quickly due to use of templates.  It does require the be-definitive library to be loaded once.

## I Object

If we need our HTML to be HTML5 compliant, we should probably prefix be- with data-.  That is supported.

The postfix -definitive is configurable also, within each ShadowDOM realm.

Editing JSON-in-html can be rather error prone.  A [VS Code extension](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available to help with that, and is compatible with web versions of VSCode.

## Example 2 -- Template-based declarative web component

The "definer" can be a template to start with, and we can also apply "interpolation-from-a-distance":

```html
<template be-definitive='{
  "config":{
    "tagName": "hello-world",
    "propDefaults":{
      "place": "Venus",
      "updateTransform":{
        "div": ["Hello, ", "place"]
      }
    }
  }
}'>
    <div>Sapere aude</div>
</template>
<hello-world place=Mars></hello-world>
<hello-world></hello-world>
```

## Example 3 -- Pre-rendered web components that use declarative Shadow DOM.

This syntax also works:

```html
<hello-world be-definitive='{
  "config":{
    "tagName": "hello-world",
    "propDefaults":{
      "place": "Venus"
    },
    "transform":{
      "span": "place"
    }
  }
}'>
  <template shadowroot=open>
    <div>Hello, <span>world</span></div>
  </template>
</hello-world>
<hello-world place=Mars></hello-world>
```

## Example 4 Referencing non-JSON serializable entities. [TODO]

There is a reason all the settings we've seen so far have been wrapped inside a "config" key.  That reason is that there are inputs that can go into a web component configuration that are not JSON serializable.  Unfortunately, I could not come up with a short, memorable name for "JSON-serializable config section", so I stuck with "config." But the bottom line is:  **The config section should only contain pure JSON.**

Other recognized "inputs" that can go into a web component definition are non-serializable props, the superclass, and mixins.  So we want to support the ability to pass such things in to the web component stew, while sticking to declarative-ish syntax.

Proposed Syntax:

```html
<hello-world be-definitive='{
  "config":{
    "...": "..."
  },
  "complexPropDefaults": {
    "messageHandler": "my-script:messageHandler"
  },
  "superclass": "my-script:myClass",
  "mixins": ["my-script:myMixin1"]
}'>

<script nomodule id=my-script be-functional>

  export const messageHandler = e => {

  }
  export const myClass = class extends HTMLElement{

  }

  export const myMixin1 = class {

  }
</script>
```

...with the help of the soon-to-be-developed [be-functional](https://github.com/bahrus/be-functional) package.

be-functional script tags can use ESM Module imports, so the amount of code found in this somewhat unorthodox location can be minimized.






