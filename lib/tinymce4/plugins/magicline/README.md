# magicline for TinyMCE V4

Helps users to add new paragraphs in unreachable areas (*Between 2 consecutives blocks or images, before the first or after the last Html element, ...*).


*Magicline between IMG and DIV*
![](http://oi58.tinypic.com/2rxuvc5.jpg)



*Magicline before first IMG in DIV column*
![](http://oi58.tinypic.com/348235g.jpg)

### Some context...
Having switched from *CKEditor* to *TinyMCE* for various reasons, I was missing the Magic Line plugin very much !
I couldn't find anything close to that plugin for *TinyMCE*, so I've created one myself.

I haven't checked how things are done in the *CKEdtor*'s version, so this plugin may not behave exactly as the original one.

Luckily, it turns out to suit my needs even more so than the *CKEditor*'s did !

# How it works

When enabled, this plugin display a dashed line with a "return" button when the mouse cursor comes near an area where the text cursor can't be placed.

**Typically unreachable areas** :
- Between two consecutives DIV/IMG elements
- Between the top of the editor area and the first element (if it's a DIV or IMG tag).
- Same goes for the bottom and the last element
- Between the top of a block container and its first child (if it's a DIV or IMG tag)
- Same goes for the bottom of a container and its last child
- ...

This plugin works either with iframe or inline mode.

Be aware that the plugin appends a **relative** display style to the root element (*BODY element in iframe mode, and editable element in inline mode*) in order to put the magicline in the right place.

# How to use it

After having added the magicline plugin folder into the TinyMCE plugin directory, just add it to your plugin list in the **tinymce.init()** method.

**Default setup** :
```js
tinymce.init({
    plugins: 'magicline'
});
```

**Optionally**, some variables are available for you to customize the look and behavior of the plugin (*Following values are the default ones*) :
```js
tinymce.init({
    // Define the dashed line, button's background and arrows color
    magicline_color: '#4A8DE0',

    // Array of Html elements to check
    magicline_targetedItems: ['DIV','IMG'],

    // Define the distance between the mouse and the targeted item
    // at which the magicline will be displayed (in pixel)
    magicline_triggerMargin: 20,

    // The element's tagname to insert
    magicline_insertedBlockTag: 'p'
});
```

**Finaly**, if you dont want an element listed in [**magicline_targetedItems**] option to trigger the magicline display, you can add the CSS class '**nomagicline**' to it.

For instance, the first *DIV* will trigger the display, but the second won't :
```html
<div></div>
<div class="nomagicline"></div>
```

(If necessary, the class '**nomagicline**' will automatically be added to the [**valid_classes**] option by the plugin so it won't be stripped away by TinyMCE)

### Languages

* English
* French
* Italian
* Romanian
* Russian
* Spanish
