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
                        if (currentGenerationDuration > 0) 
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

/*

        ## Closest food in the vision cone - angle
        1. Define vision cone.
        2. Filter all food that lies within the cone.
        3. Find the closest one.
        4. Calculate the difference between fish heading and the direction to the food.
  */
        var closestFoodDistance = VISION_RANGE;
        var closestFoodAngle = 0;

        if (this.movement.mag() > 0) {
            objs.forEach(obj =>
                {
                    if (obj && obj instanceof Food) {
                        var a = this.movement.angleBetween (createVector(obj.position.x - this.position.x, obj.position.y - this.position.y));
                        var d = dist (this.position.x, this.position.y, obj.position.x, obj.position.y);
                        if ((abs (a) < PI / 10) && (d < closestFoodDistance)) {
                            closestFoodDistance = d;
                            closestFoodAngle = a;
                        }
                    }
                        
                });
            }

        // calculate food area sensing
        
        var fas = 0;
        
        for (let x = max (Math.floor((this.position.x - 100) / FOOD_DENSITY_GRID_STEP), 0); x <= min ((this.position.x + 100) / FOOD_DENSITY_GRID_STEP, FDG_WIDTH - 1); x++)
          for (let y = max ((Math.floor(this.position.y - 100) / FOOD_DENSITY_GRID_STEP), 0); y <= min ((this.position.y + 100) / FOOD_DENSITY_GRID_STEP, FDG_HEIGHT - 1); y++)
              fas += foodDensity[x][y] / ((x * FOOD_DENSITY_GRID_STEP - this.position.x)^2 + (y * FOOD_DENSITY_GRID_STEP - this.position.y)^2 );
        
        // collect inputs

        var inputs = [

            this.movement.mag(),
            this.size,
            this.foodVision,
            fas,
            closestFoodDistance / VISION_RANGE,
            closestFoodAngle

        ];

        // activate brain

        var thoughts = this.brain.activate(inputs);
        
        //squashing the output with a logistic function

        this.thought = (ACTIONS - 2)/(1 + Math.pow(Math.E, -thoughts[0]));
        this.steering = PI / 8 / (1 + Math.pow(Math.E, -thoughts[1])) - PI / 4;

        if (this.thought > ACTIONS) console.log("Warning - thought exceeds ACTIONS" + this.thought);

    }

    act() {

        //pulse
        if ((this.thought > 1) && (this.thought <= 2) && (this.movement.mag() < 2)) {
            if (this.movement.mag() == 0)
                this.movement = p5.Vector.random2D().mult((this.thought - 1) * 5)
            else
                this.movement.setMag(this.movement.mag() + (this.thought - 1) * 5);
            this.size *= 1 - 0.05 * (this.thought - 1);
            return;
        }

        // split

        if ((this.size > 20) && (this.thought > 2) && (this.thought <= 3)) {
            this.split();
            return;
        }

        // turn

        this.movement.rotate(this.steering);

    }

    split() {
        this.size /= 2;
        this.brain.clear();
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
    }

    delete() {
        super.delete();
        this.brain.score = currentGenerationDuration;
    }

    click(x, y) {
        if (p5.Vector.dist(this.position, createVector(x, y)) < this.size) {
            this.split();
            }

    }
    

}