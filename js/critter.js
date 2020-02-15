class Critter extends Obj {

    constructor(x, y, brain) {
        super(x, y);
        this.size = 20;
        this.movement = new p5.Vector;
        this.eatenTimer = 0;
        this.thought = 0;


        this.brain = brain;
        this.color;
        this.foodVision;
    }

    draw() {
        fill(color(this.color, 50, 70));
        super.draw();
        if (VERBOSE) {
            fill("black");
            text(round(this.foodVision * 100), this.position.x, this.position.y);
        }
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
                        if (currentGenerationDuration == 0) 
                            this.size = sqrt(sq(this.size) + sq(objs[i].getSize()));

                        objs[i].delete();
                    }
                }
            }
        }

        //expend energy on ambient bodily functions
        this.size *= 0.999;

        //die if too small
        if (this.size < 5) {
            this.delete();
            var food = new Food(this.position.x, this.position.y);
            food.size = this.size;
            food.setMovement(this.movement);
            objs.push(food);
        }
    }

    think() {

        // calculate food vision

        this.foodVision = 0;

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

            for (var j = round(min(x1, x2) / FOOD_DENSITY_GRID_STEP); j < round(max(x1, x2) / FOOD_DENSITY_GRID_STEP); j++) {
                for (var k = round(min(y1, y2) / FOOD_DENSITY_GRID_STEP); k < round(max(y1, y2) / FOOD_DENSITY_GRID_STEP); k++) {

                    let x0 = (j + 1 / 2) * FOOD_DENSITY_GRID_STEP;
                    let y0 = (k + 1 / 2) * FOOD_DENSITY_GRID_STEP;

                    let distance = // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
                        abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / max(1, len);

                    const r = FOOD_DENSITY_GRID_STEP / (2 ^ (1 / 2));

                    if (distance < r) {
                        let weight = foodDensity[j][k] / max(1, dist(x1, y1, x0, y0)) * (r - distance);
                        this.foodVision += weight;
                        if (VERBOSE) {
                            fill("black");
                            ellipse(x0, y0, weight, weight);
                        }
                    }

                }
            }
        }

        // collect inputs

        var inputs = [

            this.movement.mag(),

            this.size,

            this.foodVision,

            // fish vision

            objs.filter(obj => obj instanceof Critter)
            .reduce((acc, el) =>
                (acc + el.size / p5.Vector.dist(this.position, el.position)),
                0
            )

        ];

        // activate brain

        this.thought = this.brain.activate(inputs)[0] * ACTIONS % ACTIONS;
        if (this.thought > ACTIONS) console.log("Warning - thought exceeds ACTIONS" + this.thought);

    }

    act() {

        //pulse
        if ((this.thought > 1) && (this.thought <= 2) && (this.movement.mag() < 2) && (this.eatenTimer <= 0)) {
            if (this.movement.mag() == 0)
                this.movement = p5.Vector.random2D().mult((this.thought - 1) * 5)
            else
                this.movement.setMag(this.movement.mag() + (this.thought - 1) * 5);
            this.size *= 1 - 0.1 * (this.thought - 1);
            return;
        }

        // split

        if ((this.size > 20) && (this.thought > 2) && (this.thought <= 3)) {
            
            this.size /= 2;
            
            var b = this.brain.clone();
            b.mutateRandom();
            this.brain.mutateRandom();
            var critter = new Critter(this.position.x, this.position.y, b);
            neat.resize([b]);

            var v = p5.Vector.random2D();
            v.setMag(this.movement.mag());
            critter.setSize(this.size);
            critter.setMovement(v);
            critter.color = this.color;
            objs.push(critter);
            
            this.movement = p5.Vector.mult(v, -1);
            
            return;
        }


        // turn

        if ((this.thought > 3) && (this.thought <= 5))

            this.movement.rotate((PI / 2) * (this.thought - 3) - PI / 4);


    }

    delete() {
        super.delete();
        this.brain.score = 0;
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