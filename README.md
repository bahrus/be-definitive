# be-definitive () [TODO]

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/be-definitive)
[![NPM version](https://badge.fury.io/js/be-definitive.png)](http://badge.fury.io/js/be-definitive)
[![Playwright Tests](https://github.com/bahrus/be-definitive/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-definitive/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-definitive?style=for-the-badge)](https://bundlephobia.com/result?p=be-definitive)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-definitive?compression=gzip">

Turn a fragment of live HTML, or a template element, into a Reusable ItemScoped Scriplet.

Example 1:  Inferred props

```html
<table>
    <thead><th>Name</th><th>SSN Number</th></thead>
    <tbody>
        <tr data-ld='{"@type": "Person"}'>
            <td itemprop=name>Burt</td>
            <td itemprop=ssn>123-45-6789</td>
            <script be-definitive='{"inferProps": true}'></script>
        </tr>
        <tr data-ld='{"@type": "Person", "name": "Sally", "ssn": "987-65-4321"}'></tr>
        <tr data-ld='{"@type": "Person", "name": "Sally", "ssn": "987-65-4321"}'></tr>
    </tbody>
</table>
```

Only clone the template for other tr's if innerHTML is empty.


```html
<table>
    <thead><th>Name</th><th>SSN Number</thead>
    <tbody>
        <template be-definitive 🫚 itemscope=my-item itemref="a13245 b39596"></template>
        <tr id=a13245 be-definitive>
            <td>
                <my-item></my-item>
                <span itemprop=name>Burt</span>
            </td>
            <td itemprop=ssn>123-45-6789</td>
        </tr>
        <tr id=b39596>
            <td itemprop=address>654 Penny Lane</td>
            <td itemprop=cellphone>345-25-2686<</td>
        </tr>
        <template itemscope=my-item></template>
    </tbody>
</table>
```

automatically captures the template based on itemref's.  Auto expands others

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








