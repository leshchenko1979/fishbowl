var foods = [];
var critters = [];
var objs = [];
var foodDensity = [];
var stats = [];

function mouseClicked() {
    for (var i = 0; i < objs.length; i++) {
        if (objs[i]) objs[i].click(mouseX, mouseY);
    }

}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20);
    background(100);

    //add objects

    for (var i = 0; i < 100; i++)
        objs.push(new Food(random() * width, random() * height));

    for (var i = 0; i < 10; i++)
        objs.push(new Critter(random() * width, random() * height));
}

function draw() {
    background(100);

    //calculate food density
    foodDensity = Array(((width / 10 >> 0) + 1) * (height / 10 >> 0) + 1);
    foodDensity.fill(0);
    objs.forEach(obj => {
        if (obj.constructor.name == "Food")
            foodDensity[round(obj.getPosition().x / 10) * ((width / 10 >> 0) + 1) + round(obj.getPosition().y / 10)] += obj.getSize();
    });

    //main cycle

    var i = 0;
    do {
        if (objs[i]) objs[i].live();
        if (objs[i]) objs[i].draw();
    }
    while (objs.length - 1 > i++);

    // delete deleted

    i = 0;
    do {
        if (objs[i].isDeleted()) delete objs[i];
    }
    while (objs.length - 1 > i++);

    //clean up deleted from objs

    objs = objs.filter(el => { if (el) return true; });

    //collect stats

    if (frameCount % 100 == 0) {
        var foods = objs.filter(el => el.constructor.name == "Food");
        var foodMass = foods.reduce((i, el) => i + el.getSize(), 0);
        stats.push(foodMass);
    }
    //Respawm a critter if no crittrrs left

    if (objs.filter(obj => obj instanceof Critter).length == 0)
        objs.push(new Critter(random() * width, random() * height));
}

class Obj {

    constructor(x, y) {
        this.position = createVector(x, y);
        this.size = 4;
        this.movement = createVector();
        this.deleted = false;
    }

    draw() {
        ellipse(this.position.x, this.position.y, this.size * 2, this.size * 2);
    }

    live() {
        this.move();
    }

    move() {
        var newposition = p5.Vector.add(this.movement, this.position);

        //bounce off walls

        if ((newposition.x + this.size > width) || (newposition.x - this.size < 0)) {
            this.movement.x *= -1;
            newposition = p5.Vector.add(this.movement, this.position);
        }
        if ((newposition.y + this.size > height) || (newposition.y - this.size < 0)) {
            this.movement.y *= -1;
            newposition = p5.Vector.add(this.movement, this.position);
        }

        this.position = newposition;

        //check if already outside edges

        if (this.position.x - this.size < 0) this.position.x = this.size;
        if (this.position.y - this.size < 0) this.position.y = this.size;
        if (this.position.x + this.size > width) this.position.x = width - this.size;
        if (this.position.y + this.size > height) this.position.y = height - this.size;


        //slow down

        if (this.movement.mag < 0.1) {
            this.movement.setMag(0)
        } else {
            this.movement.mult(0.99);
        };

    }

    getPosition() {
        return this.position;
    }

    getSize() {
        return this.size;
    }

    setPosition(vec) {
        this.position = vec;
    }

    setMovement(vec) {
        this.movement = vec;
    }

    setSize(size) {
        this.size = size;
    }

    click(x, y) {}

    delete() {
        this.deleted = true;
    }

    isDeleted() {
        return (this.deleted);
    }
}

class Food extends Obj {

    draw() {
        fill('white');
        super.draw();
    }

    live() {
        super.live();

        //grow


        //var score = (height - this.position.y);
        var foodSize = foodDensity[round(this.position.x / 10) * ((width / 10 >> 0) + 1) + round(this.position.y / 10)];
        if (((!foodSize) || (foodSize < 10)) && (random() < 0.1)) this.size += 0.1;
        else if ((foodSize > 10) && (random() < 0.1)) this.size -= 0.3;

        //		console.log (foodSize);


        //split

        if ((this.size > 10) && (random() < 0.05)) {
            this.size /= 3;
            var food = new Food();
            var v = p5.Vector.random2D();
            v.mult(0.4);
            food.setPosition(this.position);
            food.setSize(this.size);
            food.setMovement(v);
            objs.push(food);
            this.movement = p5.Vector.mult(v, -1);

        }

        //die

        if (this.size < 3) this.delete();

    }
}

class Critter extends Obj {

    constructor(x, y) {
        super(x, y);
        this.size = random() * 40;
        this.movement = p5.Vector.mult(p5.Vector.random2D(), random() * 3);
        this.eatenTimer = 0;

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

        //split

        if ((this.size > 20) && (random() < 0.01)) {
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
        //die if too small
        if (this.size < 5) {
            this.delete();
            var food = new Food(this.position.x, this.position.y);
            food.setMovement(this.movement);
            objs.push(food);
        }
    }

    think() {}

    act() {

        //pulse
        if ((random() < 0.01) && (this.movement.mag() < 2) && (this.eatenTimer <= 0)) {
            this.movement.setMag(this.movement.mag() + this.size / 5);
            this.movement.rotate(random() * PI / 10 - PI / 5);
            this.size *= 0.9;
        }
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