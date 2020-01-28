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