# be-definitive [TODO]

be-definitive is an attribute-based version of the [d-fine](https://github.com/bahrus/d-fine) custom element.

It allows us to take some DOM that needs to repeat, and turn it into a web component.

Or DOM that is already repeating (using declarative Shadow DOM), but that needs to be made interactive, via a web component.

```html
<be-definitive upgrade=* if-wants-to-be=definitive></be-definitive>
...

## Example 1 -- Prerended live DOM that is repeated

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

The "definer" can be a template to start with, and we can also apply interpolation-from-a-distance:

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

## Example 3 -- Pre-rendered web components that use declarative Shadow DOM. [TODO]

This syntax also works:

```html
<hello-world be-definitive='{
    "propDefaults":{
      "place": "Venus"
    },
    "transform":{
      "span": "place"
    }
}'>
    <template shadowroot=open>
        <div>Hello, <span>world</span></div>
    </template>
</hello-world>
<hello-world place=Mars></hello-world>
```

