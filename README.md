# be-definitive

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/be-definitive)
[![NPM version](https://badge.fury.io/js/be-definitive.png)](http://badge.fury.io/js/be-definitive)
[![Playwright Tests](https://github.com/bahrus/be-definitive/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-definitive/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-definitive?style=for-the-badge)](https://bundlephobia.com/result?p=be-definitive)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-definitive?compression=gzip">

> [!Note]
> The functionality supported by be-definitive has been moved "closer to the core", and is supported by [xtal-element](https://github.com/bahrus/xtal-element?tab=readme-ov-file#part-iii---web-components-from-html-streamed-content) now.  Perhaps this enhancement will be provided a new (reduced) role in the future, but for now, consider it to be deprecated.

be-definitive allows us to take some DOM that is in the live DOM tree, or DOM that is imported into the tree via fetch, and turn it into a web component.  This allows that DOM to appear again in other parts of the page via a single tag.  Customizations can be made to each instance based on the values of properties / attributes.

And even with the original DOM that was in the live DOM tree, turning it into a web component allows us to "hydrate" the static DOM  into something that is interactive.

Basically, be-definitive is a solution for declarative custom elements (once the necessary dependencies are downloaded).  But the functionality can be seamlessly extended to support non-declarative custom elements as well, as we will see below.

## [Demo](https://codepen.io/bahrus/pen/VwzPwmv)

## Example 1 -- Pre-rendered live DOM that is reused

```html
<div be-definitive=hello-world>
    <div>Hello, <span>world</span></div>
</div>
...

<hello-world></hello-world>
```

Renders:

```html
<div be-definitive=hello-world>
    <div>Hello, <span>world</span></div>
</div>
...
<hello-world>
    <div>Hello, <span>world</span></div>
</hello-world>
```

**NB:** Shadow DOM is bypassed in this instance.  It makes sense in this case not to use Shadow DOM for consistency between the original, defining element, and subsequent instances, for styling consistency.

In fact, the following may make more sense from a styling perspective, and also works:

## Example 1a -- Pre-rendered live DOM specifies the name of the web component:

```html
<hello-world enh-by-be-definitive>
    <div>Hello, <span>world</span></div>
</hello-world>
<hello-world></hello-world>
```

Renders:

```html
<hello-world enh-by-be-definitive>
  <div>Hello, <span>world</span></div>
</hello-world>
<hello-world>
  <div>Hello, <span>world</span></div>
</hello-world>
```

The need for prefixing be-definitive with enh-by is there to simply reduce the chances of causing conflicts with web components that use be-definitive as an attribute they recognize.

## Example IIa:  With inline binding

We can add explicit inline binding using microdata attributes:

```html
<hello-world enh-by-be-definitive>
    <div itemscope>Hello, <span itemprop=place>world</span></div>
</hello-world>
<hello-world place=Venus></hello-world>
<hello-world place=Mars></hello-world>
```


...renders:

```html
<hello-world enh-by-be-definitive>
    <div itemscope>Hello, <span itemprop=place>world</span></div>
</hello-world>
<hello-world place=Venus>
    <div itemscope>Hello, <span itemprop=place>Venus</span></div>
</hello-world>
<hello-world place=Mars>
    <div itemscope>Hello, <span itemprop=place>Mars</span></div>
</hello-world>
```


So the first instance of the pattern displays without a single byte of Javascript being downloaded. 

Subsequent instances take less bandwidth to download, and generate quite quickly due to use of templates.  It does require the be-definitive library to be loaded once.

## Example IIb -- With dynamic properties, binding from a distance

```html
<div be-definitive='{
  "config":{
    "tagName":"hello-world",
    "propDefaults":{
      "place": "Venus",
      "transform":{
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
    <div>Hello, <span>world</span></div>
</div>
<hello-world place=Mars>
    <div>
        <div>Hello, <span>Mars</span></div>
    </div>
</hello-world>
```

Again, using ShadowDOM is somewhat iffy, as styling is fundamentally different between the "defining" element and subsequent elements.  But it is the default behavior.

To enable ShadowDOM, use the "shadowRootMode" setting:

```html
<div be-definitive='{
  "config":{
    "tagName":"hello-world",
    "propDefaults":{
      "place": "Venus",
      "transform":{
        "span": "place"
      },
      "shadowRootMode": "open"
    },
  }

}'>
  <div>Hello, <span>world</span></div>
</div>
<hello-world place=Mars></hello-world>
```

## I Object

Editing JSON-in-html can be rather error prone.  A [VS Code extension](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) is available to help with that, and is compatible with web versions of VSCode.

And in practice, it is also quite ergonomic to edit these declarative web components in a *.mjs file that executes in node as the file changes, and compiles to an html file via the [may-it-be](https://github.com/bahrus/may-it-be) compiler.  This allows the attributes to be editable with JS-like syntax.  Typescript 4.6 supports compiling mts to mjs files, which then allows typing of the attributes.  Examples of this in practice are:

1.  [xtal-side-nav](https://github.com/bahrus/xtal-side-nav)
2.  [xtal-editor](https://github.com/bahrus/xtal-editor)
3.  [cotus](https://github.com/bahrus/cotus)
4.  [plus-minus](https://github.com/bahrus/plus-minus)
5.  [scratch-box](https://github.com/bahrus/scratch-box)

Anyway.

The "transform" setting uses [DTR](https://github.com/bahrus/trans-render) syntax, similar to CSS, in order to bind the template, but *be-definitive* eagerly awaits inline binding with Template Instantiation being built into the platform as well.

To apply multiple transforms, use an array.  Each transform should only be applied when the dependent properties change ("place" in this case).


## Example 3 -- Template-based declarative web components

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

The interpolation is currently a bit limited  (can't interpolate between a closing tag and an opening tag), and doesn't use Ranges[TODO].

## Example 4 -- Pre-rendered web components that use streaming declarative Shadow DOM.

This syntax also works:

```html
<hello-world>
  <template shadowrootmode=open>
      <div itemscope>Hello, <span itemprop=place>world</span></div>
    <style adopt>
      span {
        color: green;
      }
    </style>
    <be-hive enh-by-be-definitive></be-hive>
  </template>
</hello-world>
<hello-world place=Mars></hello-world>
<hello-world place=Venus></hello-world>
```

It requires declarative [ShadowDOM polyfill for Firefox](https://web.dev/declarative-shadow-dom/#detection-support).

## Server-side rendering

A large swath of useful web components, for example web components that wrap some of the amazing [codepens](https://duckduckgo.com/?q=best+codepens+of&t=h_&ia=web) we see, don't (or shouldn't, anyway) require a single line of custom Javascript.  The slot mechanism supported by web components can go a long way towards weaving in dynamic content.

In that scenario, the CDN server of the (pre-built) static HTML file (or a local file inclusion, imported into the solution via npm) *is* the SSR solution, as long as the HTML file can either be 
1.  Embedded in the server stream for the entire page, or
2.  Client-side included, via a solution like Jquery's [load](https://api.jquery.com/load/) method, [k-fetch](https://github.com/bahrus/k-fetch), [include-fragment-element](https://github.com/github/include-fragment-element), [sl-include](https://shoelace.style/components/include), [templ-mount](https://github.com/bahrus/templ-mount), [xtal-fetch](https://github.com/bahrus/xtal-fetch), [html-includes](https://www.filamentgroup.com/lab/), [wc-include](https://www.npmjs.com/package/@vanillawc/wc-include), [ng-include](https://www.w3schools.com/angular/ng_ng-include.asp), [html-include-element](https://www.npmjs.com/package/html-include-element) or countless other ought-to-be-built-into-the-platform-already-but-isn't options (sigh).
3.  On the client-side include side, [be-importing](https://github.com/bahrus/be-importing) is specifically tailored for this scenario.

The good people of github, in particular, earn a definitive stamp of approval from be-definitive.  They are definitely onto something quite significant, with [their insightful comment](https://github.com/github/include-fragment-element#relation-to-server-side-includes):

>This declarative approach is very similar to SSI or ESI directives. In fact, an edge implementation could replace the markup before its actually delivered to the client.

```html
<include-fragment src="/github/include-fragment/commit-count" timeout="100">
  <p>Counting commits…</p>
</include-fragment>
```

>A proxy may attempt to fetch and replace the fragment if the request finishes before the timeout. Otherwise the tag is delivered to the client. This library only implements the client side aspect.

[Music to my ears!](https://youtu.be/rnM-ULNxDus?t=239)


The client-side approach is more conducive to fine-grained caching, while the server-side stream approach better for above-the-fold initial view metrics.

If going with the server-side route, there are certainly scenarios where weaving in dynamic content in the server is useful, beyond what can be done with slots, in order to provide a better initial view.

One solution being pursued for this functionality is the [xodus cloudflare helper classes project](https://github.com/bahrus/xodus)/[edge-of-tomorrow](https://github.com/bahrus/edge-of-tomorrow).  Eventually, [w3c willing](https://github.com/whatwg/dom/issues/1222).

Its goal is to apply the "transform(s)" specified above, but in the cloud (or service worker) for the initial render (or pre-render?).

## Example 5 -- Referencing non-JSON serializable entities.

There is a reason all the settings we've seen so far have been wrapped inside a "config" key.  That reason is that there are inputs that can go into a web component configuration that are not JSON serializable.  Unfortunately, I could not come up with a short, memorable name for "JSON-serializable config section", so I stuck with "config." But the bottom line is:  **The config section should only contain pure JSON, or JSON-serializable entities if using an mjs build step.**

Other recognized "inputs" that can go into a web component definition are non-serializable prop default values, the superclass, and mixins.  So we want to support the ability to pass such things in to the web component stew, while sticking to declarative-ish syntax.

The following is supported:

```html
<hello-world be-definitive>
  <template shadowroot=open>
    <div>Hello, <span>world</span></div>
    <be-hive be-definitive='{
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
  </template>
</hello-world>

<script nomodule id=my-script>

  export const messageHandler = e => {

  }
  export const myClass = class extends HTMLElement{

  }

  export const myMixin1 = class {

  }

</script>
```

The script tag can also be placed within the shadowDOM of the web component if applicable.  The code searches first within the Shadow DOM.

This also allows us to tap into powerful rendering libraries like [lit-html](https://www.npmjs.com/package/lit-html).

be-exportable script tags can use ESM Module imports, so the amount of code found in this somewhat unorthodox location can be minimized.

Another way to reference external web components is via the [be-active](https://github.com/bahrus/be-active) template tag custom enhancement.

## Styling

For more efficient template cloning / repetitive styling, use style tag with attribute "adopt":

```html
<style adopt>
  div{
    color:red;
  }
</style>
```

This will take advantage of constructible stylesheets when available.

## Viewing this element locally

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/dev in a modern browser.

## Running Tests

```
> npm run test
```

## Importing in ES Modules:

```JavaScript
import 'be-definitive/be-definitive.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/be-definitive';
</script>
```








