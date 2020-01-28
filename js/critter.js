class Critter extends Obj {

    constructor(x, y) {
        super(x, y);
        this.size = random() * 40;
        this.movement = p5.Vector.mult(p5.Vector.random2D(), random() * 3);
        this.eatenTimer = 0;
        this.thought = 0;

/*

- 0: do nothing
- 1: pulse
- 2: split
- 3: turn right
- 4: turn left

*/
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

        this.thought = 0;
        select: {
            if (random() < 0.01) {
                this.thought = 1; //pulse
                break select;
            }

            if (random() < 0.01) {
                this.thought = 2; //split
                break select;
            }

            if (random() < 0.1) {
                this.thought = 3; // turn left
                break select;
            }

            if (random() < 0.1) {
                this.thought = 4; // turn right
                break select;
            }
        }
        
    }

    act() {

        //pulse
        if ((this.thought == 1) && (this.movement.mag() < 2) && (this.eatenTimer <= 0)){
            this.movement.setMag(this.movement.mag() + this.size / 5);
            this.size *= 0.9;
        }

        // split

        if ((this.size > 20) && (this.thought == 2)) {
            this.size /= 2;
            var critter = new Critter();
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