# be-definitive

be-definitive allows us to take some DOM (maybe that that needs to repeat), and turn it into a web component.

Or DOM that is already repeating (using declarative Shadow DOM), but that needs to be made interactive, via a web component.

Basically, declarative custom elements (once the necessary dependencies are downloaded).

## [Demo](https://codepen.io/bahrus/pen/VwzPwmv)

## Example 1 -- Prerendered lib DOM that is repeated

```html
<div be-definitive=hello-world>
    <div>Hello, <span>world</span></div>
</div>
<hello-world></hello-world>
```

## Example 2 -- With dynamic properties

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

The updateTransform uses [trans-render](https://github.com/bahrus/trans-render) syntax.

## I Object

If we need our HTML to be HTML5 compliant, we should probably prefix be- with data-.  That is supported.

The postfix -definitive is configurable also, within each ShadowDOM realm.

Editing JSON-in-html can be rather error prone.  A [VS Code extension](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available to help with that, and is compatible with web versions of VSCode.

## Example 3 -- Template-based declarative web component

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

## Example 4 -- Pre-rendered web components that use declarative Shadow DOM.

This syntax also works:

```html
<hello-world be-definitive='{
  "config":{
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

<details>
  <summary>Thoughts on server-side rendering</summary>

So a natural thought is we should have a file, "hello-world.html" that can be used in various scenarios:

1.  Embeddable in a larger HTML stream during server-side rendering.  Need to populate span with place parameter.
2.  Standalone web request with query string parameters for the values of the props

I am going to focus on doing this within a Cloudflare Worker environment, as it is a mature cloud based solution that seems "on the conservative" side, providing functionality without sacrificing performance.  I like how, for the most part, it adheres to the syntax of service workers that are available in the browser, so that the api feels like it is "here to stay".

The most apparent first step is that we need a function, call it renderFile, that can take said file and process it and write it to some output stream.

Taking a cue from how Cloudflare's [streaming support works](https://github.com/PierBover/cloudflare-workers-streams-example/blob/master/renderPage.js) (haven't tried it yet, this all theoretical), one of our parameters is a encodeAndWrite function.

```TypeScript
renderFile(filePath: string, props: any, encodeAndWrite: (html: string) => void): void
```

This would work fine if we are okay having the span hidden or displaying something generic during SSR, and wait for JS to be loaded to actually see live data.

But let's think through what it would take to get live data into that span.

In some future happy place, [Cloudflare Workers](https://community.cloudflare.com/t/domparser-in-worker/169917) will have support for working with fully parsed HTML, against which queries can be performed, like in a browser.  Ideally because Service Workers would also have such support.  But that seems quite far off.  

This poses problems for a syntax like what we have above, that isn't very "JS friendly."

Cloudflare does support something called HTML Rewriting, which in theory could work with template syntax like we've seen above, but that is a significant amount of work needed and their HTML Rewriting approach is far from an industry standard.  If such a thing could work inside service workers of a browser, it would be a more tempting api to invest in.  It also likes the ability to perform .matches queries on the elements, making the mapping rather difficult.

So we need a "server-side compile step".  Similar to how asp.net of yore would take html markup and compile it first to slew of ugly c# write statements, which would then be fully compiled to an optimized binary.

A natural place to perform this compile step would be with Puppeteer -- the compiler could be tested in a browser, with all its development debugging tools, then run automatically via a background node process / github action.


</details>

## Example 5 Referencing non-JSON serializable entities.

There is a reason all the settings we've seen so far have been wrapped inside a "config" key.  That reason is that there are inputs that can go into a web component configuration that are not JSON serializable.  Unfortunately, I could not come up with a short, memorable name for "JSON-serializable config section", so I stuck with "config." But the bottom line is:  **The config section should only contain pure JSON.**

Other recognized "inputs" that can go into a web component definition are non-serializable props, the superclass, and mixins.  So we want to support the ability to pass such things in to the web component stew, while sticking to declarative-ish syntax.

The following is supported:

```html
<hello-world be-definitive='{
  "config":{
    "...": "..."
  },
  "scriptRef": "my-script",
  "complexPropDefaults": {
    "messageHandler": "messageHandler"
  },
  "superclass": "myClass",
  "mixins": ["myMixin1"]
}'>
  <template shadowroot=open>
    <div>Hello, <span>world</span></div>
  </template>
</hello-world>

<script nomodule id=my-script be-exportable>

  export const messageHandler = e => {

  }
  export const myClass = class extends HTMLElement{

  }

  export const myMixin1 = class {

  }
</script>
```

...with the help of the [be-exportable](https://github.com/bahrus/be-exportable) package.

be-exportable script tags can use ESM Module imports, so the amount of code found in this somewhat unorthodox location can be minimized.

## Exammple 6 -- Even less declarative

The trans-render library can work with scenarios where declarative JSON isn't expressive enough to describe what to do. We can tap into this power using the script reference:

```html
<hello-world be-definitive='{
  "config":{
    "propDefaults":{
      "place": "Venus"
    }
  },
  "scriptRef": "my-script",
  "complexPropDefaults": {
    "messageHandler": "messageHandler",
    "updateTransform": "knockYourselfOut"
  }
}'>
  <template shadowroot=open>
    <div>Hello, <span>world</span></div>
  </template>
</hello-world>

<script nomodule id=my-script be-exportable>
  export const messageHandler = e => {
    console.log(e);
  };
  export const knockYourselfOut = {
      span: ({target}) => {
          target.appendChild(document.body);
      }
  }
</script>
```




