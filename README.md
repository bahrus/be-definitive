# be-definitive

# be-definitive


```html
<be-definitive upgrade=my-custom-element if-wants-be-definitive></be-definitive>

...

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

