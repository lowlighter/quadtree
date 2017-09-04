# Quadtree
This library is an implementation in JavaScript of **Quadtrees** structures.

* [Live demo](https://lowlighter.github.io/quadtree/demo/)
* [Documentation](https://lowlighter.github.io/quadtree/docs/)
* [About](https://lowlight.fr/en/blog/quadtree-library/)


# Features
* **Light weight** libray
* Configure maximum **nodes capacity** and **depth level**
* **Respect ES6** data structures prototype (add, delete, clear, has, forEach, ...)
* Support **all** object types



## Getting Started
First of all, you'll need to include the library :
```html
    <script src="./bin/lowlight.quadtree.js"></script>
```

You may include the minified library instead :
```html
    <script src="./bin/lowlight.quadtree.min.js"></script>
```

Then you may create alias for convenience :
```javascript
    let Quadtree = Lowlight.Quadtree
```

## Create a new quadtree

You can create a new quadtree this way :

```javascript
    let quadtree = new Quadtree({width:400, height:400})
```

You configure at anytime `quadtree.max_items` *(number of items before subdividing)* and `quadtree.max_depth` *(maximum depth of quadtree instance)*.
You may need to use `quadtree.rebuild()` method afterwards.

```javascript
    quadtree.max_items = 4
    quadtree.max_depth = 7
```

## Manage data

### Insertions

You can add any type of object in a quadtree, however it must have at least the following properties :
`x`, `y`, `width` (or `w`) and `height` (or `h`).

Then, just call `quadtree.add(item)` to add an item to the quadtree.

For example :
```javascript
    //Regular insertion
        let a = quadtree.add({x:20, y:20, width:10, height:10})
    //Full-specified insertion
        let b = quadtree.add({x:70, y:120, w:10, h:15, ax:0.5, ay:0.5, mx:5, my:10})
```

#### Anchors

By default, the point used for calculations is the top-left corner *(0;0)*.
You can move it for each object by setting `ax` and `ay` properties *(values must be between 0 and 1)*.
This means that *(0.5;0.5)* will use the center of the rectangle for calculations wheras *(1;1)* will use the bottom-right point instead.

#### Margins

You can also add margins to both sides to virtually increase width and height by setting `mx` and `my` properties.

#### Retrieve close items

To retrieve all items contained in the same node of a specific item, call the `quadtree.retrieve(item)` method.
This will return a `Set` without the given node.

```javascript
    let tests = quadtree.retrieve(a)
    tests.forEach(item => console.log(a.collide(item) ? "Collision" : "Nothing"))
```

### Updates

Updating the location or the dimensions of an item already in your quadtree will require that you rebuild quadtree manually.
This operation is quite expensive.

```javascript
    quadtree.rebuild()
```

You can call it this method from a quadtree's nodes to rebuild only a part of it.

```javascript
    quadtree.nodes[0].rebuild()
```

### Deletion

You can remove a single item from the quadtree just be calling `quadtree.delete(item)` method.

```javascript
    quadtree.delete(a)
```

To clear entirely the quadtree, just call `quadtree.clear()` method.

```javascript
    quadtree.clear()
```



## Project content
|            |                             |
| ---------- | --------------------------- |
| **/bin**   | Live and dev scrripts files |
| **/src**   | Source files                |
| **/demo**  | Demo and codes examples     |
| **/docs**  | Documentation               |

## Rebuild project and expanding the library
You'll need to run the following command the first time to install dependencies.
```shell
npm install
```

Then to rebuild project, just run the following command :
```shell
npm run build
```

This will update `/bin` files with included `/src` files.
Although `package.json` (which contains `"source" and "output"` paths) are preconfigured, you may need to reconfigure them if you're planning to expand this library.

To include a file just use the following syntax in the `"source"` file :
```javascript
    /* #include <path/to/file.js> */
```

* File minification is performed with [Babel minify](https://github.com/babel/minify).
* Documentation is generated with [JSDoc 3](https://github.com/jsdoc3/jsdoc).

Although `package.json` (which contains `"jsdoc_source", "jsdoc_output", "jsdoc_config" and "jsdoc_readme"`) and `docs/categories.json` are preconfigured, you may need to reconfigure them if you're planning to expand this library.

## License
This project is licensed under the MIT License.

See [LICENSE.md](https://github.com/lowlighter/quadtree/blob/master/LICENSE.md) file for details.
