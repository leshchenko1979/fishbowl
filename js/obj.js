class Obj {

    constructor(x, y) {
        this.position = createVector(x, y);
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
