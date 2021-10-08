# be-definitive [TODO]

be-definitive is an attribute-based version of the [d-fine](https://github.com/bahrus/d-fine) custom element.

```html
<be-definitive upgrade=* if-wants-to-be=definitive></be-definitive>
...

## Example 1:

```html
<div be-definitive='{
  "as":"hello-world",
  "propDefaults":{
    "place": "Venus"
  },
  "transform":{
    "span": "place"
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

## Example 2

The "definer" can be a template to start with, and we can also apply interpolation-from-a-distance:

```html
<template be-definitive='{
  "as": "hello-world",
  "propDefaults":{
    "place": "Venus"
  },
  "transform":{
    "div": ["Hello, ", "place"]
  }
}'>
    <div>Sapere aude</div>
</template>
<hello-world place=Mars></hello-world>
<hello-world></hello-world>
```


<my-custom-element be-definitive>
<template shadowroot="open">
  My ShadowDOM Content I
</template>
<span slot=mySlot>My Slotted Content I</span>
</div>
</my-custom-element>

<my-custom-element>
  <span slot=mySlot>My Slotted Content II</span>
</my-custom-element>

<my-custom-element>
  <template shadowroot="open">
    My ShadowDOM Content III
  </template>
  <span slot=mySlot>My Slotted Content III</span>
</div>

```

be-metamorphic:

1.  If my-custom-element isn't defined:
    1.  Defines custom element my-custom-element with template (or shadow DOM) as the main template (use getInnerHTML({includeShadowRoots: true}))?
    2.  Uses ctor prop which defines the class.  Uses x.tend 

