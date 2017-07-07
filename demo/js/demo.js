$(function () {
    //Create PIXI View
        let app = new PIXI.Application(400, 400, {transparent:true})
        $(".pixi-view").append(app.view)

    //Layers
        let nodes = app.stage.addChild(new PIXI.ParticleContainer())
        let particles = app.stage.addChild(new PIXI.ParticleContainer(50000, {position:true, uvs:true})), player, ennemy
        let attack = app.stage.addChild(new PIXI.Sprite())
        let param = {x:0, y:0, w:app.view.width, h:app.view.height, max_items:5, max_depth:6}, quadtree = new Lowlight.Quadtree(param)
        let key = {z:false, q:false, s:false, d:false, shift:false}

    //Particles
        class Particle {
            //Constructor
                constructor(x, y, vx, vy) {
                    this.vx = vx
                    this.vy = vy
                    this.sprite = particles.addChild(new PIXI.Sprite())
                    this.sprite.anchor.set(0.5)
                    this.sprite.position.set(x, y)
                    this.state = 0
                }

            //Collision states
                get state() { return this._state }
                set state(v) { if (this.state !== v) { this._state = v, this.sprite.texture = PIXI.Texture.fromFrame(v+".png") } }

            //Data
                set x(v) { this.sprite.position.x = v }
                get x() { return this.sprite.position.x }
                set y(v) { this.sprite.position.y = v }
                get y() { return this.sprite.position.y }
                get height() { return this.sprite.height }
                get width() { return this.sprite.width }
                get ax() { return this.sprite.anchor.x }
                get ay() { return this.sprite.anchor.y}

            //Update coordinates and destroy if outside
                update() {
                    this.state = 0
                    this.x += this.vx
                    this.y += this.vy
                    if ((this.x < quadtree.x)||(this.x > quadtree.width)||(this.y < quadtree.y)||(this.y > quadtree.height)) { this.destroy() }
                }

            //Destroy
                destroy() {
                    quadtree.delete(this)
                    this.sprite.destroy()
                    this.sprite = null
                }

            //Global update
                static update() { quadtree.entries.forEach(p => p.update()) }
        }

    //Player
        class Playable extends Particle {
            //Constructor
                constructor(x, y) {
                    super(x, y, 0, 0)
                    this.sprite.texture = PIXI.Texture.fromFrame("marisa.png")
                }

            //Update coordinates
                update() {
                    this.vx = (key.shift ? 1 : 3)*(key.q ? -1 : key.d ? +1 : 0)
                    this.vy = (key.shift ? 1 : 3)*(key.z ? -1 : key.s ? +1 : 0)
                    this.x = Math.max(0, Math.min(this.x + this.vx, app.view.width))
                    this.y = Math.max(0, Math.min(this.y + this.vy, app.view.height))
                }

            //Collision test
                collide(item) {
                    return !((this.x + this.width < item.x)||(item.x + item.width < this.x)||(this.y + this.height < item.y)||(item.y + item.height < this.y))
                }

            //Override collision states
                set state(v) { }
                get state() { return 0 }
        }

    //Particles generator
        class Ennemy extends Particle {
            //Constructor
                constructor(x, y) {
                    super(x, y, 0, 0)
                    this.sprite.texture = PIXI.Texture.fromFrame("flandre.png")
                    this.t = 0, this.dt = 0
                    this.patterns = {line:false, forward:false, random:true, towards:false, circle:false}
                }

            //Update and particles generation
                update() {
                    //Update time
                        this.t += 0.02
                        this.dt++
                        let nx = (app.view.width/2)+135*Math.sqrt(2)*Math.cos(this.t)/(Math.sin(this.t)*Math.sin(this.t)+1)
                        let ny = 50+70*Math.sqrt(2)*Math.cos(this.t)*Math.sin(this.t)/(Math.sin(this.t)*Math.sin(this.t)+1)

                    //Particles generation
                        if ((this.patterns.line)&&(this.dt % 3 == 0)) { this.line(this.dt) }
                        if ((this.patterns.forward)&&(this.dt % 1 == 0)) { this.forward(nx, ny) }
                        if ((this.patterns.random)&&(this.dt % 1 == 0)) { this.random() }
                        if ((this.patterns.towards)&&(this.dt % 2 == 0)) { this.towards(nx, ny) }
                        if ((this.patterns.circle)&&(this.dt % 10 == 0)) { this.circle() }

                    //Update position
                        this.x = nx, this.y = ny
                }

            //Line pattern
                line(dt) {
                    quadtree.add(new Particle(this.x, this.y, 0, 3))
                }

            //Random pattern
                random() {
                    quadtree.add(new Particle(this.x, this.y, 3*Math.random()-3*Math.random(), 3*Math.random()-3*Math.random()))
                }

            //Forward pattern
                forward(nx, ny) {
                    quadtree.add(new Particle(this.x, this.y, nx-this.x, ny-this.y))
                }

            //Toward player pattern
                towards(nx, ny) {
                    let dx = player.x-nx, dy = player.y-ny
                    let ds = 3/Math.max(Math.abs(dx), Math.abs(dy))
                    dx *= ds, dy *= ds
                    quadtree.add(new Particle(this.x, this.y, dx, dy))
                }

            //Circle pattern
                circle() {
                    for (let i = 0; i <= 2*Math.PI; i+= 0.1*Math.PI) {
                        let dx = Math.cos(i), dy = Math.sin(i)
                        quadtree.add(new Particle(this.x, this.y, dx, dy))
                    }
                }

            //Override collision states
                set state(v) { }
                get state() { return 0 }
        }

    //keyboard controls
        $("[name='controls']").click(function () { $(this).prop("disabled", true).text("Enabled !") ; $("[name='keyboard']").focus() })
        $("[name='keyboard']").keydown(function (event) {
            switch (event.key) {
                case 'z': case 'w': key.z = true; event.preventDefault(); break;
                case 'q': case 'a': key.q = true; event.preventDefault(); break;
                case 's': key.s = true; event.preventDefault(); break;
                case 'd': key.d = true; event.preventDefault(); break;
                case "Shift": key.shift = true; event.preventDefault(); break;
            }
        }).keyup(function (event) {
            switch (event.key) {
                case 'z': case 'w': key.z = false; event.preventDefault(); break;
                case 'q': case 'a': key.q = false; event.preventDefault(); break;
                case 's': key.s = false; event.preventDefault(); break;
                case 'd': key.d = false; event.preventDefault(); break;
                case "Shift": key.shift = false; event.preventDefault(); break;
            }
        }).focusout(function () { $("[name='controls']").prop("disabled", false).text("Enable") })

    //Update function
        function update() {
            //Update
                Particle.update()
            //Collisions states
                quadtree.rebuild()
                quadtree.render()
                let list = quadtree.retrieve(player)
                list.forEach(item => { item.state = player.collide(item) ? 2 : 1 })
            //Render and coputations
                $(".code-particles *").text(quadtree.entries.size)
                $(".particles-numbers").val(quadtree.entries.size)
                $(".particles-tested").val(list.size)
        }

    //Demo function
        function demo(regenerate) {
            //Build map
                if (regenerate) {
                    quadtree.clear()
                    quadtree.add(player)
                    quadtree.add(ennemy)
                }

            //Sync code with data
                $('[name="items"]').val(quadtree.max_items)
                $('[name="depth"]').val(quadtree.max_depth)
                $(".code-items").find("*").text($('[name="items"]').val())
                $(".code-depth").find("*").text($('[name="depth"]').val())
                $('[name^="pattern-"]').each(function () { $(this).val(ennemy.patterns[$(this).attr("name").match(/pattern-(.*)/)[1]] ? "1" : "0") })
        }

    //Render quadtree
        Lowlight.Quadtree.prototype.render = function () {
            //Rebuild if root
                if (this.root) { nodes.removeChildren() }
            //Display sprite
                this.sprite = nodes.addChild(new PIXI.Sprite(PIXI.TextureCache[["a", "b", "a", "b"][this.root ? 0 : this.parent.nodes.indexOf(this)]+".png"]))
                this.sprite.position.set(this.x, this.y)
                this.sprite.width = this.width
                this.sprite.height = this.height
            //Render child nodes
                if (!this.leaf) { this.nodes.map(node => node.render()) }
        }

    //Clear method override
        let clear = Lowlight.Quadtree.prototype.clear
        Lowlight.Quadtree.prototype.clear = function (soft) {
            if (this.sprite) {
                this.sprite.destroy()
                this.sprite = null
            }
            clear.call(this, soft)
        }

    //Interactivity
        $('[name="items"]').on("change", function () { quadtree.max_items = $(this).val() ; $(".code-items").find("*").text($('[name="items"]').val()) })
        $('[name="depth"]').on("change", function () { quadtree.max_depth = $(this).val() ; $(".code-depth").find("*").text($('[name="depth"]').val()) })
        $('[name^="pattern-"]').on("change", function () { ennemy.patterns[$(this).attr("name").match(/pattern-(.*)/)[1]] = $(this).val() === "1" })

    //Load textures
        PIXI.loader.onError.add(() => $(".cross-origin-error").show())
        PIXI.loader.add("src/sprite.json").load(() => {
            //Initalization
                player = new Playable(app.view.width/2, app.view.height-50)
                ennemy = new Ennemy(app.view.width/2, 50)
                demo(true)
                app.ticker.add(update)
        })
})
