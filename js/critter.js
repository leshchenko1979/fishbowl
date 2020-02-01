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
      fill(color (this.brainIndex * 10, 50, 70));
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

        // collect and normalize inputs

        var inputs = [
        
            // inverting foodDensity as a means of normalisation
            
            foodDensity[round(this.getPosition().y / 10) * ((width / 10 >> 0) + 1) + round(this.getPosition().x / 10)] / 100,

            // normalisation of speed 

            this.movement.mag() / 7,
 
            // inverting fish size as a means of normalisation

            1 / this.size

        ];

        // activate brain

        this.thought = Math.floor (this.brain.activate(inputs)[0] * 5);

    }

    act() {

        //pulse
        if ((this.thought == 1) && (this.movement.mag() < 2) && (this.eatenTimer <= 0)){
            if (this.movement.mag() == 0)
                this.movement = p5.Vector.random2D().mult (5)
            else
                this.movement.setMag(this.movement.mag() + 5);
            this.size *= 0.9;
        }

        // split

        if ((this.size > 20) && (this.thought == 2)) {
            this.size /= 2;
            var critter = new Critter (0, 0, this.brainIndex);
            var v = p5.Vector.random2D();
            v.setMag (this.movement.mag());
            // v.mult(2);
            critter.setPosition(this.position);
            critter.setSize(this.size);
            critter.setMovement(v);
            objs.push(critter);
            this.movement = p5.Vector.mult(v, -1);
        }

        // turn left

        if (this.thought == 3) 

            this.movement.rotate(- PI / 5);

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