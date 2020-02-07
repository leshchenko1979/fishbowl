// declare fishbowl vars

var foods = [];
var critters = [];
var objs = [];
var foodDensity = [];
var stats = [];
var neat;
var maxTotalFishSize = [];
var NNcomplexity;

const SENSES = 4;
const ACTIONS = 5;

var td = Array(ACTIONS);

const FOOD_DENSITY_GRID_STEP = 20;
const FOOD_DENSITY_THRESHOLD = 20;
const VISION_RANGE = 200;

const VERBOSE = true;

var FDG_WIDTH, FDG_HEIGHT;

var viz, vizfit;

// GA settings
const INITIAL_PLAYER_AMOUNT = 10;
const ITERATIONS = 1000;
const MUTATION_RATE = 0.3;
const ELITISM_PERCENT = 0.1;

const MAX_FRAMES_PER_GENERATION = 100;
var framesLeft = MAX_FRAMES_PER_GENERATION;


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
    colorMode(HSB, 100);

    initNeat();

    NNcomplexity = neat.population.reduce((acc, el) => Math.max(acc, el.nodes.length + el.connections.length), 0);
    td.fill(0);

    FDG_WIDTH = ((width / FOOD_DENSITY_GRID_STEP) >> 0) + 1; // FDG = food density grid
    FDG_HEIGHT = ((height / FOOD_DENSITY_GRID_STEP) >> 0) + 1;

    //add objects

    for (var i = 0; i < 500; i++)
        objs.push(new Food(random() * width, random() * height));

    for (var i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
        objs.push(new Critter(random() * width, random() * height, i));
        maxTotalFishSize.push([0, 0]); // [max size of the corresponding brainIndex on this frame, max size in this iteration]
    }

    // add charts

    viz = new Chart("viz", {
        type: "horizontalBar",
        data: {
            labels: ['stay', 'pulse', 'split', "left", "right"],
            datasets: [{
                label: "action distribution",
                data: td
            }]
        }
    });

    vizfit = new Chart("vizfit", {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                    label: "fitness",
                    data: [],
                    backgroundColor: 'rgb(255, 99, 132)',
                    yAxisID: "left-y-axis"
                },
                {
                    label: "NN complexity",
                    data: [],
                    backgroundColor: 'rgb(99, 255, 132)',
                    yAxisID: "right-y-axis"
                }]
            },
        options: {
            scales: {
                yAxes: [{
                    id: 'left-y-axis',
                    type: 'linear',
                    position: 'left'
                }, {
                    id: 'right-y-axis',
                    type: 'linear',
                    position: 'right'
                }]
            }
        }
    });


}

function draw() {
    background("gray");

    //calculate food density

    foodDensity = Array(FDG_WIDTH).fill(0).map(x => Array(FDG_HEIGHT).fill(0));

    objs.forEach(obj => {
        if (obj instanceof Food)
            foodDensity[round(obj.position.x / FOOD_DENSITY_GRID_STEP)][round(obj.position.y / FOOD_DENSITY_GRID_STEP)] += obj.size;
    });

    //main cycle

    // init food stats

    maxTotalFishSize.forEach(el => (el[0] = 0));

    // let the objects live

    var i = 0;
    do {
        if (objs[i]) objs[i].live();
        if (objs[i]) objs[i].draw();
    }
    while (objs.length - 1 > i++);

    // finalize fish stats on this frame

    maxTotalFishSize.forEach(el => (el[1] = Math.max(el[0], el[1])));

    // delete deleted

    i = 0;
    do {
        if (objs[i].isDeleted()) delete objs[i];
    }
    while (objs.length - 1 > i++);

    //clean up deleted from objs

    objs = objs.filter(el => { if (el) return true; });

    // display stats

    document.getElementById("frames").textContent = framesLeft;

    objs.forEach(obj => { if (obj instanceof Critter) td[Math.floor(obj.thought)]++ });

    viz.data.datasets[0].data = td;
    viz.update();


    // new generation

    if ((--framesLeft == 0) || (objs.filter(obj => obj instanceof Critter).length == 0))
        newGeneration();

}

function newGeneration()

{


    //evaluation

    for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++)
        neat.population[i].score = maxTotalFishSize[i][0] + maxTotalFishSize[i][1];

    neat.evolve();

    // save neat to localstorage

    localStorage.setItem("population", JSON.stringify(neat.toJSON()));

    //kill off remaining objs

    objs = [];

    //create new food

    for (var i = 0; i < 500; i++)
        objs.push(new Food(random() * width, random() * height));

    // create new fish

    for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
        objs.push(new Critter(random() * width, random() * height, i));
    }

    // udpate fitness viz

    var maxfitness = maxTotalFishSize.reduce((acc, el) => Math.max(el[0] + el[1], acc), 0);
    vizfit.data.labels.push(neat.generation);
    vizfit.data.datasets[0].data.push(maxfitness);
    vizfit.data.datasets[1].data.push(NNcomplexity);
    vizfit.update();

    document.getElementById("generation").textContent = neat.generation + 1;

    //reset fish size stats

    NNcomplexity = neat.population.reduce((acc, el) => Math.max(acc, el.nodes.length + el.connections.length), 0);
    maxTotalFishSize = maxTotalFishSize.map(() => { return ([0, 0]) });
    td.fill(0);

    //reset frame countdown

    framesLeft = Math.floor(maxfitness * 10);

}

function initNeat() {

    try {
        let p = localStorage.getItem("population");
        neat = new carrot.Neat();
        neat.fromJSON(JSON.parse(p));
        console.log("Neural network population imported from the previous session");
        return;
    } catch (e) {
        console.log(e);
        console.log("Importing neural network population failed, creating a random one")
    };

    neat = new carrot.Neat(
        SENSES,
        1,
        null, {
            population_size: INITIAL_PLAYER_AMOUNT,
            mutation_rate: MUTATION_RATE,
            elitism: ELITISM_PERCENT * INITIAL_PLAYER_AMOUNT
        }
    );
}