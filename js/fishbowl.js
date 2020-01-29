/** Rename vars */
var Neat    = neataptic.Neat;
var Methods = neataptic.Methods;
var Config  = neataptic.Config;
var Architect = neataptic.Architect;

// declare fishbowl vars

var foods = [];
var critters = [];
var objs = [];
var foodDensity = [];
var stats = [];
var neat;
var maxTotalFishSize = [];



// GA settings
var INITIAL_PLAYER_AMOUNT     = 10;
var ITERATIONS        = 1000;
var MUTATION_RATE     = 0.3;
var ELITISM_PERCENT   = 0.1;

var MAX_FRAMES_PER_GENERATION = 1000;
var framesLeft = MAX_FRAMES_PER_GENERATION;

/*
function mouseClicked() {
    for (var i = 0; i < objs.length; i++) {
        if (objs[i]) objs[i].click(mouseX, mouseY);
    }

}
*/

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20);
    background("gray");
    colorMode (HSB, 100);

    initNeat();
    
    //add objects

    for (var i = 0; i < 500; i++)
        objs.push(new Food(random() * width, random() * height));

    for (var i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
        objs.push (new Critter(random() * width, random() * height, i));
        maxTotalFishSize.push ([0, 0]); // [max size of the corresponding brainIndex on this frame, max size in this iteration]
    }


}

function draw() {
    background("gray");

    //calculate food density
    foodDensity = Array(((width / 10 >> 0) + 1) * (height / 10 >> 0) + 1);
    foodDensity.fill(0);
    objs.forEach(obj => {
        if (obj instanceof Food)
            foodDensity[round(obj.getPosition().y / 10) * ((width / 10 >> 0) + 1) + round(obj.getPosition().x / 10)] += obj.getSize();
    });

    //main cycle

    // init food stats

    maxTotalFishSize.forEach (el => (el[0] = 0));

    // let the objects live

    var i = 0;
    do {
        if (objs[i]) objs[i].live();
        if (objs[i]) objs[i].draw();
    }
    while (objs.length - 1 > i++);

    // finalize fish stats on this frame

    maxTotalFishSize.forEach (el => (el[1] = Math.max (el[0], el[1])));

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
        var foods = objs.filter(el => el instanceof Food);
        var foodMass = foods.reduce((i, el) => i + el.getSize(), 0);
        stats.push(foodMass);
    }

    // display generation coundown

    text (framesLeft, 10, 10);

    // new generation

    if ((--framesLeft == 0) || (objs.filter(obj => obj instanceof Critter).length == 0)) {
        
        //kill off remaining fish

        objs.forEach(obj => {if (obj instanceof Critter) obj.delete();});

        //evaluation
        
        for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++)
            neat.population[i].score = maxTotalFishSize[i][0] + maxTotalFishSize[i][1];

        neat.sort;
        var newpopulation = [];
        for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
            newpopulation[i] = neat.getOffspring();
            objs.push(new Critter(random() * width, random() * height, i));
        }

        // Replace the old population with the new population
        neat.population = newpopulation;
        neat.mutate();
        neat.generation++;

        //reset fish size stats

        maxTotalFishSize.fill([0,0]);

        //reset frame countdown

        framesLeft = MAX_FRAMES_PER_GENERATION;

    }
}

function initNeat(){
    neat = new Neat(
      3,
      1,
      null,
      {
 /*       mutation: [
            neataptic.methods.mutation.ADD_NODE,
            neataptic.methods.SUB_NODE,
            neataptic.methods.ADD_CONN,
            neataptic.methods.SUB_CONN,
            neataptic.methods.MOD_WEIGHT,
            neataptic.methods.MOD_BIAS,
            neataptic.methods.MOD_ACTIVATION,
            neataptic.methods.ADD_GATE,
            neataptic.methods.SUB_GATE,
            neataptic.methods.ADD_SELF_CONN,
            neataptic.methods.SUB_SELF_CONN,
            neataptic.methods.ADD_BACK_CONN,
            neataptic.methods.SUB_BACK_CONN
          ], */
        popsize: INITIAL_PLAYER_AMOUNT,
        mutationRate: MUTATION_RATE,
        elitism: ELITISM_PERCENT * INITIAL_PLAYER_AMOUNT,
        network: new neataptic.architect.Random(
          3,
          4,
          1
        )
      }
    );
}