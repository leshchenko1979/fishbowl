class Critter extends Obj {

    constructor(x, y, brain) {
        super(x, y);
        this.size = random() * 40;
        this.movement = p5.Vector.mult(p5.Vector.random2D(), random() * 3);
        this.eatenTimer = 0;
        this.thought = 0;

        this.brain = brain;
    }

    draw() {
        if (this.eatenTimer <= 0) fill('red');
        else fill('green');
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
                if (objs[i] && objs[i].constructor.name == "Food") {
                    var distance = p5.Vector.dist(this.position, objs[i].getPosition());
                    if ((this != objs[i]) && (distance < this.size + objs[i].getSize())) {
                        this.eatenTimer += objs[i].getSize() * 1;
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
            food.setMovement(this.movement);
            objs.push(food);
        }
    }

    think() {

        // collect and normalize inputs

        var inputs = [
        
            // inverting foodDensity as a means of normalisation
            
            foodDensity[round(this.getPosition().x / 10) * ((width / 10 >> 0) + 1) + round(this.getPosition().y / 10)] / 100,

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
            this.movement.setMag(this.movement.mag() + 5);
            this.size *= 0.9;
        }

        // split

        if ((this.size > 20) && (this.thought == 2)) {
            this.size /= 2;
            var critter = new Critter (0, 0, this.brain); // !!!! very dumb brain split implementation
            var v = p5.Vector.random2D();
            v.mult(2);
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


        this.thought = 0;
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