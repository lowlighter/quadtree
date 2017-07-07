# Quadtree
This library is an implementation in JavaScript of **Quadtrees** structures.

* [Live demo](https://lowlighter.github.io/quadtree/demo/)
* [Documentation](https://lowlighter.github.io/quadtree/docs/)

# Features
* **Light weight** libray
* Configure maximum **nodes capacity** and **depth level**
* **Respect ES6** data structures prototype (add, delete, clear, has, forEach, ...)
* Support **all** object types

## Getting Started
First of all, you need to include the library :
```html
    <script src="./bin/lowlight.quadtree.js"></script>
```

Then you may want create an alias for convenience :
```javascript
    let Quadtree = Lowlight.Quadtree
```

## Create a quadtree

You can create a new quadtree this way :

```javascript
    let quadtree = new Quadtree({width:400, height:400})
```

### Configuring quadtree

You can change at any time the maximum capacity for each node (**max_items**) before subdividing and the max depth (**max_depth**) of quadtree instance.

This may need a rebuild afterwards.

```javascript
    quadtree.max_items = 4
    quadtree.max_depth = 7
```

## Managing data

### Add some datas

You can add any types of data in your quadtree.
The only requirement are the **x**, **y**, **width** (or **w**) and **height** (or **h**) properties.

```javascript
    let a = quadtree.add({x:20, y:20, width:10, height:10})
```

#### Special properties

**ax** and **ay** (values between 0 and 1) are used to change anchor point.
This is the point used for calculations. [0;0] is default and means that anchor is Top-Left whereas [1;1] means Bottom-Right.
You may prefer to use the middle of your shape by choosing [0.5;0.5] as anchor point.

**mx** and **my** are used to add margins to both sides to virtually increase width and height.

```javascript
    let b = quadtree.add({x:70, y:120, w:10, h:15, ax:0.5, ay:0.5, mx:5, my:10})
```

### Remove data

You can remove a single node this way :

```javascript
    quadtree.delete(a)
```

And clear entirely the quadtree with this :

```javascript
    quadtree.clear()
```

### Update data

After updating an item from your quadtree, you may need to rebuild it.
Note that this operation is quite expensive.

```javascript
    quadtree.rebuild()
```

It can be called from sub-quadtrees instance to rebuild only a part of quadtree

```javascript
    quadtree.nodes[0].rebuild()
```

## Retrieve items in the same node

You can retrieve all the items in the same node of another item with **retrieve(item)** method.
It returns a **Set** of items.

```javascript
    let tests = quadtree.retrieve(a)
    tests.forEach(item => console.log(a.collide(item) ? "Collision" : "Nothing"))
```

## Project content
|            |                            |
| ---------- | -------------------------- |
| **/bin**   | Production and test files  |
| **/src**   | Source files               |
| **/demo**  | Demo and codes examples    |
| **/docs**  | Library's documentations   |

### Rebuild project

If you need to rebuild project, just run the following command :
```
npm run build
# /bin will be updated with /src scripts files
# /docs will be updated
```

Don't forget to install dependencies before running the previous command.
```
npm install
```

## License
This project is licensed under the MIT License. See [LICENSE.md](https://github.com/lowlighter/quadtree/blob/master/LICENSE.md) file for details.
