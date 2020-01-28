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
