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

var MAX_FRAMES_PER_GENERATION = 100;
var framesLeft = MAX_FRAMES_PER_GENERATION;
var SENSES = 2;
var ACTIONS = 3;
var maxNNsize;
var td = Array(ACTIONS);

var FOOD_DENSITY_GRID_STEP = 20;
var FOOD_DENSITY_THRESHOLD = 20;

/*
function mouseClicked() {
    for (var i = 0; i < objs.length; i++) {
        if (objs[i]) objs[i].click(mouseX, mouseY);
    }

}
*/

function setup() {
    var canvas = createCanvas(windowWidth * 0.9 - 20, windowHeight - 30);
    canvas.parent('canvas');
    background("gray");
    colorMode (HSB, 100);

    initNeat();

    maxNNsize = neat.population.reduce ((acc, el) => Math.max (acc, el.nodes.length), 0);
    td.fill(0);

    
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
    foodDensity = Array(((width / FOOD_DENSITY_GRID_STEP >> 0) + 1) * ((height / FOOD_DENSITY_GRID_STEP >> 0) + 1));
    foodDensity.fill(0);
    objs.forEach(obj => {
        if (obj instanceof Food)
            foodDensity[round(obj.getPosition().y / FOOD_DENSITY_GRID_STEP) * (width / FOOD_DENSITY_GRID_STEP >> 0) + round(obj.getPosition().x / FOOD_DENSITY_GRID_STEP)] += obj.getSize();
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

    // display stats

    document.getElementById("generation").textContent=neat.generation + 1;
    document.getElementById("frames").textContent=framesLeft;

    var maxfitness = maxTotalFishSize.reduce ((acc, el) => Math.max(el[0]+el[1],acc), 0);
    document.getElementById("maxfitness").textContent = Math.round(maxfitness);

    document.getElementById("maxNNsize").textContent = maxNNsize;

    objs.forEach (obj => {if (obj instanceof Critter) td[obj.thought]++});
    var sumtd = td.reduce ((acc, el) => acc + el, 0);


    new Chart(document.getElementById("viz").getContext("2d"), {
        type: 'bar',
        data: td
    });

    document.getElementById("d0").textContent = Math.round(td[0] / sumtd * 100);
    document.getElementById("d1").textContent = Math.round(td[1] / sumtd * 100);
    document.getElementById("d2").textContent = Math.round(td[2] / sumtd * 100);
 
    // new generation

    if ((--framesLeft == 0) || (objs.filter(obj => obj instanceof Critter).length == 0)) {
        
        //reset objects

        objs = [];

        //evaluation
        
        for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++)
            neat.population[i].score = maxTotalFishSize[i][0] + maxTotalFishSize[i][1];

        neat.sort;
        var newpopulation = [];
        for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
            newpopulation[i] = neat.getOffspring();
            objs.push(new Critter(random() * width, random() * height, i));
        }

        for (var i = 0; i < 500; i++)
        objs.push(new Food(random() * width, random() * height));

        // Replace the old population with the new population
        neat.population = newpopulation;
        neat.mutate();
        neat.generation++;

        //reset fish size stats

        maxNNsize = neat.population.reduce ((acc, el) => Math.max (acc, el.nodes.length), 0);
        maxTotalFishSize = maxTotalFishSize.map (() => {return ([0,0])});
        td.fill(0);
       
        //reset frame countdown

        framesLeft = Math.floor(maxfitness * 10);

        //draw graph of the network

        // d3.graph(neat.population[0], '#viz');
    


    }
}

function initNeat(){
    neat = new carrot.Neat(
      SENSES,
      1,
      null,
      {
        popsize: INITIAL_PLAYER_AMOUNT,
        mutationRate: MUTATION_RATE,
        elitism: ELITISM_PERCENT * INITIAL_PLAYER_AMOUNT,
        network: new carrot.architect.Random(
          SENSES,
          SENSES + 1,
          1
        )
      }
    );
}