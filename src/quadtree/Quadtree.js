class Quadtree {
    /**
     * <pre>
     * Quadtree class.
     * A quadtree is a tree data structure in which each internal node has exactly four children.
     * </pre>
     * @param {Object} [options] - Options
     * @param {Number} [options.x=0] - X coordinate
     * @param {Number} [options.y=0] - Y coordinate
     * @param {Number} [options.width=0] - Width (<span class="bold">options.w</span> is also accepted)
     * @param {Number} [options.height=0] - Height (<span class="bold">options.h</span> is also accepted)
     * @param {Number} [options.max_items=0] - Max items per instance
     * @param {Number} [options.max_depth=0] - Max depth
     * @example <caption>Basic usage</caption>
     * //Declare quadtree
     * let quadtree = new Lowlight.Quadtree({x:0, y:0, width:400, height:400})
     *
     * //Add some datas
     * let a = quadtree.add({x:20, y:20, width:10, height:10})
     * let b = quadtree.add({x:70, y:120, width:10, height:15, ax:0.5, ay:0.5, mx:5, my:10})
     *
     * //Retrieve items in the same node as <span class="bold">a</span>
     * quadtree.retrieve(a)
     *
     * //Update quadtree
     * a.x += 10
     * a.y += 10
     * quadtree.rebuild()
     *
     * //Change quadtree configurations
     * quadtree.max_items = 10
     * quadtree.max_depth = 4
     *
     * //Remove a node
     * quadtree.delete(a)
     *
     * //Remove all nodes
     * quadtree.clear()
     * @category structures
     */
        constructor(options = {}) {
            /**
             * X coordinate.
             * @readonly
             * @type {Number}
             */
                this.x = options.x||0

            /**
             * Y coordinate.
             * @readonly
             * @type {Number}
             */
                this.y = options.y||0

            /**
             * Width.
             * @readonly
             * @type {Number}
             */
                this.width = Number.isFinite(options.width) ? options.width : Number.isFinite(options.w) ? options.w : 300

            /**
             * Height.
             * @readonly
             * @type {Number}
             */
                this.height = Number.isFinite(options.height) ? options.height : Number.isFinite(options.h) ? options.h : 300

            /**
             * Set of inserted items in instance
             * @readonly
             * @type {Set}
             */
                this.items = new Set()

            /**
             * Set of inserted items in instance and its children
             * <div class="alert danger">
             * Unlike other ES6 data structures, <span class="bold">Quadtree.entries</span> does <span class="bold">not</span> return an <span class="bold">Iterator [value, value]</span>.
             * </div>
             * @readonly
             * @type {Set}
             */
                this.entries = new Set()

            /**
             * Reference to parent instance.
             * @readonly
             * @type {Set|null}
             */
                this.parent = options.parent||null

            /**
             * References to child instances.
             * @readonly
             * @type {Set|null}
             */
                this.nodes = [null, null, null, null]

            /**
             * Depth of current instance.
             * @readonly
             * @type {Set|null}
             */
                this.depth = (this.parent !== null) ? this.parent.depth + 1 : 0

            //Unreferenced properties
                this.max_items = options.max_items||4
                this.max_depth = options.max_depth||4
        }

    /**
     * <pre>
     * Max items per instance.
     * If there are more item in an instance, it will be splitted (if max depth isn't reached).
     * Updating this property through root instance will update all child instances.
     * </pre>
     * @type {Number}
     */
        get max_items() { return (this.parent !== null) ? this.parent.max_items : this._max_items }
        set max_items(v) { if (this.root) { this._max_items = v } }

    /**
     * <pre>
     * Max depth of quadtree.
     * Updating this property through root instance will update all child instances.
     * </pre>
     * @type {Number}
     */
        get max_depth() { return (this.parent !== null) ? this.parent.max_depth : this._max_depth }
        set max_depth(v) { if (this.root) { this._max_depth = v } }

    /**
     * Remove all items from instance.
     * @param {Boolean} [soft=false] - If enabled, entries list won't be cleared (mainly used for rebuild)
     */
        clear(soft = false) {
            if (!soft) { this.entries.clear() }
            this.items.clear()
            if (!this.leaf) { this.nodes.map(node => node.clear()) }
            if (!this.root) { this.items = this.entries = this.parent = this.nodes = null }
            else { this.nodes = [null, null, null, null] }
        }

    /**
     * Insert method.
     * @param {Object} item - Item to insert
     * @param {Number} item.x - X coordinate
     * @param {Number} item.y - Y coordinate
     * @param {Number} item.width - Width (<span class="bold">item.w</span> is also accepted)
     * @param {Number} item.height - Height (<span class="bold">item.h</span> is also accepted)
     * @param {Number} [item.ax] - X anchor (value between 0 and 1)
     * @param {Number} [item.ay] - Y anchor (value between 0 and 1)
     * @param {Number} [item.mx] - X margin (will virtually increase width)
     * @param {Number} [item.mx] - Y margin (will virtually increase height)
     */
        add(item) {
            //Reference
                this.entries.add(item)
            //Insertion (split if max capacity reached)
                if (this.leaf) {
                    this.items.add(item)
                    if ((this.items.size > this.max_items)&&(this.depth < this.max_depth)) { this.split() }
                } else { this.index(item).map(i => this.nodes[i].add(item)) }
                return item
        }

    /**
     * Removal method.
     * @param {Object} item - Item to remove
     * @return {Object} Removed item
     */
        delete(item) {
            //Reference
                this.entries.delete(item)
            //Deletion
                if (this.leaf) { this.items.delete(item) }
                else { this.index(item).map(i => this.nodes[i].delete(item)) }
        }

    /**
     * Retrieve items closed to <span class="bold">item</span> given in argument.
     * <div class="alert warning">
     * <span class="bold">list</span> argument is reserved for recursive usage of this method.
     * </div>
     * @param {Object} item - Item to test
     * @param {Set} [list] - Reference to current list
     * @return {Set} Set of items which could potentially collide with item
     */
        retrieve(item, list = new Set()) {
            //Add items if in the same leaf
                if (this.leaf) { this.items.forEach(item => list.add(item)) }
                else { this.index(item).map(i => this.nodes[i].retrieve(item, list)) }
            //Removing self-item
                return (list.delete(item), list)
        }

    /**
     * Rebuild current instance.
     * @return {Quadtree} Current instance
     */
        rebuild() {
            this.clear(true)
            this.entries.forEach(item => this.add(item))
        }

    /**
     * <pre>
     * Split instance in four child instances.
     * Rearrange items to fulfill item capacity constraints.
     * </pre>
     * @protected
     */
        split() {
            if (this.leaf) {
                //Child nodes
                    this.nodes[INDEX.NW] = new Quadtree({parent:this, width:this.width/2, height:this.height/2, x:this.x, y:this.y})
                    this.nodes[INDEX.NE] = new Quadtree({parent:this, width:this.width/2, height:this.height/2, x:this.x + this.width/2, y:this.y})
                    this.nodes[INDEX.SE] = new Quadtree({parent:this, width:this.width/2, height:this.height/2, x:this.x + this.width/2, y:this.y + this.height/2})
                    this.nodes[INDEX.SW] = new Quadtree({parent:this, width:this.width/2, height:this.height/2, x:this.x, y:this.y + this.height/2})
                //Rearrange items
                    this.items.forEach(item => { this.add(item) })
                    this.items.clear()
            }
        }

    /**
     * Tell in which node an item should belongs.
     * <div class="alert info">
     * If an item doesn't fit completly in a node, its reference will be duplicated in node's children.
     * </div>
     * @protected
     * @param {Object} item - Item
     * @param {Number} [item.ax] - X anchor (value between 0 and 1)
     * @param {Number} [item.ay] - Y anchor (value between 0 and 1)
     * @param {Number} [item.mx] - X margin (will virtually increase width)
     * @param {Number} [item.mx] - Y margin (will virtually increase height)
     * @return {Number[]} Indexes where item should be added
     */
        index(item) {
            //Coordinates, dimensions, margins and anchors
                let x = item.x||0, y = item.y||0, ax = item.ax||0, ay = item.ay||0, mx = item.mx||0, my = item.my||0
                let iw = Number.isFinite(item.width ) ? item.width  : Number.isFinite(item.w) ? item.w : 0
                let ih = Number.isFinite(item.height) ? item.height : Number.isFinite(item.h) ? item.h : 0
                let ox = ax*iw, oy = ay*ih
            //Comparison with vertical/horizontal mid-points to determine in which node item should be added
                let v = y-oy-my + ih+my < (this.y + this.height/2) ? "N" : y-oy-my > (this.y + this.height/2) ? "S" : "B"
                let h = x-ox-mx + iw+mx < (this.x + this.width /2) ? "W" : x-ox-mx > (this.x + this.width /2) ? "E" : "B"

            //Return
                return INDEXES[v+h]
        }

    /**
     * Tell if instance is a leaf (has no children).
     * @readonly
     * @type {Boolean}
     * @return {Boolean} True if instance has no children
     */
        get leaf() { return !this.nodes[0] }

    /**
     * Tell if instance is Quadtree's root.
     * @readonly
     * @type {Boolean}
     * @return {Boolean} True if instance is root
     */
        get root() { return this.depth === 0 }

    /**
     * Quadtree size (number of entries).
     * @type {Number}
     * @return {Number} Number of entries
     */
        get size() { return this.entries.size }

    /**
     * This method executes a provided function once for each value, in insertion order.
     * @param {Function} callback - Callback function
     * @param {Object} [thisArg] - Value of this
     */
        forEach(callback, thisArg) { this.entries.forEach(callback, thisArg) }

    /**
     * Tell if an item belongs to instance
     * @param {Object} item - Item to test
     * @return {Boolean} True if <span class="bold">item</span> is found in quadtree
     */
        has(item) { return this.entries.has(item) }

    /**
     * Return an Iterator which contains all values contained in Quadtree, in insertion order.
     * @return {Iterator} Inserted items in instance
     */
        values() { return this.entries.values() }

    /**
     * Return an Iterator which contains all values contained in Quadtree, in insertion order.
     * @return {Iterator} Inserted items in instance
     */
        keys() { return this.entries.keys() }
}
