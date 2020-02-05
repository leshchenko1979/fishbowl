class Critter extends Obj {

    constructor(x, y, brainIndex) {
        super(x, y);
        this.size = 20;
        this.movement = new p5.Vector;
        this.eatenTimer = 0;
        this.thought = 0;

        this.brainIndex = brainIndex;
        this.brain = neat.population[brainIndex];
    }

    draw() {
        fill(color(this.brainIndex * 10, 50, 70));
        super.draw();
    }

    live() {
        super.live();
        if (this.eatenTimer > 0) this.eatenTimer--;

        // think

        this.think();

        //act

        this.act();

        //eat food

        if (this.eatenTimer < 50) {
            for (var i = 0; i < objs.length; i++) {
                if (objs[i] && (objs[i] instanceof Food) && this.eatenTimer < 50) {
                    var distance = p5.Vector.dist(this.position, objs[i].getPosition());
                    if ((this != objs[i]) && (distance < this.size + objs[i].getSize())) {

                        this.eatenTimer += objs[i].getSize() * 1;

                        // disable eating on the first frame to mess up the fitness calculation
                        if (frameCount > 0)
                            this.size = sqrt(sq(this.size) + sq(objs[i].getSize()));

                        objs[i].delete();
                    }
                }
            }
        }

        //expend energy on ambient bodily functions
        this.size *= 0.999;

        // add my size to the corresponding brain statistics
        maxTotalFishSize[this.brainIndex][0] += this.size;

        //die if too small
        if (this.size < 5) {
            this.delete();
            var food = new Food(this.position.x, this.position.y);
            food.setMovement(this.movement);
            objs.push(food);
        }
    }

    think() {

        // calculate food vision

        var foodVision = 0;

        if (this.movement.mag() > 0) {

            var x1 = this.position.x;
            var y1 = this.position.y;

            var visionVector = p5.Vector.add(this.position, this.movement.copy().normalize().setMag(VISION_RANGE));
            var x2 = visionVector.x;
            x2 = max(x2, 0);
            x2 = min(x2, width);
            var y2 = visionVector.y;
            y2 = max(y2, 0);
            y2 = min(y2, height);

            var len = p5.Vector.dist(this.position, visionVector);

            foodVision = foodDensity.reduce((acc, el, i) => {

                let x0 = i % (width / FOOD_DENSITY_GRID_STEP + 1) + FOOD_DENSITY_GRID_STEP / 2;
                let y0 = i / ((width / FOOD_DENSITY_GRID_STEP + 1) >> 0) + FOOD_DENSITY_GRID_STEP / 2;

                let distance = // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
                    abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / len;

                return (acc + ((distance * distance) < FOOD_DENSITY_GRID_STEP ? el / dist(x1, y1, x0, y0) : 0));

            }, 0)
        }

        // collect inputs

        var inputs = [

            this.movement.mag(),

            this.size,

            foodVision,

            // fish vision

            objs.filter(obj => obj instanceof Critter)
            .reduce((acc, el) =>
                (acc + el.size / p5.Vector.dist(this.position, el.position)),
                0
            )

        ];

        // activate brain

        this.thought = Math.floor(this.brain.activate(inputs)[0] * ACTIONS) % ACTIONS;
        if (this.thought > ACTIONS) console.log(this.thought);

    }

    act() {

        //pulse
        if ((this.thought == 1) && (this.movement.mag() < 2) && (this.eatenTimer <= 0)) {
            if (this.movement.mag() == 0)
                this.movement = p5.Vector.random2D().mult(5)
            else
                this.movement.setMag(this.movement.mag() + 5);
            this.size *= 0.9;
        }

        // split

        if ((this.size > 20) && (this.thought == 2)) {
            this.size /= 2;
            var critter = new Critter(0, 0, this.brainIndex);
            var v = p5.Vector.random2D();
            v.setMag(this.movement.mag());
            // v.mult(2);
            critter.setPosition(this.position);
            critter.setSize(this.size);
            critter.setMovement(v);
            objs.push(critter);
            this.movement = p5.Vector.mult(v, -1);
        }


        // turn left

        if (this.thought == 3)

            this.movement.rotate(-PI / 5);

        // turn right

        if (this.thought == 4)

            this.movement.rotate(PI / 5);

    }

    click(x, y) {
        if (p5.Vector.dist(this.position, createVector(x, y)) < this.size) {
            while (this.size > 5) {
                var critter = new Critter();
                objs.push(critter);
                critter.setPosition(this.position);
                var s = random() * 5;
                critter.setSize(s);
                this.size -= s;
            }

        }
    }

}