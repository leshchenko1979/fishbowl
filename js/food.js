class Food extends Obj {

    draw() {
        fill('white');
        super.draw();
    }

    live() {
        super.live();

        //grow

        var foodSize = foodDensity[round(this.position.y / FOOD_DENSITY_GRID_STEP) * (width / FOOD_DENSITY_GRID_STEP >> 0) + round(this.position.x / FOOD_DENSITY_GRID_STEP)];
        if ((foodSize < FOOD_DENSITY_THRESHOLD) && (random() < 0.1)) this.size += 0.1;
        else if ((foodSize > FOOD_DENSITY_THRESHOLD) && (random() < 0.1)) this.size -= 0.3;

        //		console.log (foodSize);


        //split

        if ((this.size > 10) && (random() < 0.05) && (objs.length < 500)) {
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