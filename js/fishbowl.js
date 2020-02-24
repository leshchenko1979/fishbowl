// declare fishbowl vars

var foods = [];
var critters = [];
var objs = [];
var foodDensity = [];
var stats = [];
var neat;
var NNcomplexity;

const SENSES = 4;
const ACTIONS = 5;

var td = Array(ACTIONS); // thought density tracking array for the viz

const FOOD_DENSITY_GRID_STEP = 20;
const FOOD_DENSITY_THRESHOLD = 20;
const VISION_RANGE = 200;

var INITIAL_FOOD_AMOUNT = 50;

var FDG_WIDTH, FDG_HEIGHT;

var viz, vizfit;

// GA settings
const INITIAL_PLAYER_AMOUNT = 10;
const MUTATION_RATE = 0.3;
const ELITISM_PERCENT = 0.1;

const VERBOSE = false;
var CYCLES_PER_FRAME = 1;
var CYCLES_PER_GENERATION = 2000;
var cyclesLeft = CYCLES_PER_GENERATION;
var currentGenerationDuration = 0;
var autoDuration = false;


/*
function mouseClicked() {
    for (var i = 0; i < objs.length; i++) {
        if (objs[i]) objs[i].click(mouseX, mouseY);
    }

}
*/

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight - document.getElementById('topbar').offsetHeight - 22);
    canvas.parent('canvas');
    background("gray");
    colorMode(HSB, 100);

    initNeat();

    NNcomplexity = neat.population.reduce((acc, el) => Math.max(acc, el.nodes.length + el.connections.length), 0);
    td.fill(0);

    FDG_WIDTH = ((width / FOOD_DENSITY_GRID_STEP) >> 0) + 1; // FDG = food density grid
    FDG_HEIGHT = ((height / FOOD_DENSITY_GRID_STEP) >> 0) + 1;

    //add objects

    for (var i = 0; i < INITIAL_FOOD_AMOUNT; i++)
        objs.push(new Food(random() * width, random() * height));

    for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
        let o = new Critter(random() * width, random() * height, neat.population[i]);
        objs.push(o);
        o.color = i * 10;
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

    viz.data.datasets[0].data = td;

    vizfit = new Chart("vizfit", {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                    label: "Actual generation duration",
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

    for (var cycle = 0; cycle < CYCLES_PER_FRAME; cycle++) {
        
        //calculate food density

        foodDensity = Array(FDG_WIDTH).fill(0).map(x => Array(FDG_HEIGHT).fill(0));

        objs.forEach(obj => {
            if (obj instanceof Food)
                foodDensity[round(obj.position.x / FOOD_DENSITY_GRID_STEP)][round(obj.position.y / FOOD_DENSITY_GRID_STEP)] += obj.size;
        });

        //main cycle

        // let the objects live

        objs.forEach(obj => obj.live());

        // delete deleted

        i = 0;
        do {
            if (objs[i].isDeleted()) delete objs[i];
        }
        while (objs.length - 1 > i++);

        //clean up deleted from objs

        objs = objs.filter(el => { if (el) return true; });

        // update stats

        document.getElementById("frames").textContent = cyclesLeft;

        objs.filter(obj => obj instanceof Critter).forEach(obj => td[Math.floor(obj.thought)]++);

        currentGenerationDuration++;

        // new generation

        if ((--cyclesLeft / CYCLES_PER_FRAME <= 0) || (objs.filter(obj => obj instanceof Critter).length <= 1))
            newGeneration();


    }

    //draw everything

    background("gray");
    objs.forEach(obj => obj.draw())
    viz.update();

}

function newGeneration()

{

    //evaluation

    objs.filter(obj => obj instanceof Critter).forEach(fish => fish.brain.score = currentGenerationDuration);

    // produce new generation 

    neat.sort();

    newPopulation = Array(INITIAL_PLAYER_AMOUNT).fill(0);

    neat.population = newPopulation.map (() => neat.getOffspring());

    neat.mutate();
    neat.generation++;

    // save neat to localstorage

    localStorage.setItem("population", JSON.stringify(neat.toJSON()));

    //kill off remaining objs

    objs = [];

    //create new food

    for (var i = 0; i < INITIAL_FOOD_AMOUNT; i++)
        objs.push(new Food(random() * width, random() * height));

    // create new fish

    for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
        let o = new Critter(random() * width, random() * height, neat.population[i]);
        objs.push(o);
        o.color = i * 10;
    }
    
    //reset fish size stats

    NNcomplexity = neat.population.reduce((acc, el) => Math.max(acc, el.nodes.length + el.connections.length), 0);
    td.fill(0);
    
    // udpate fitness viz

    vizfit.data.labels.push(neat.generation);
    vizfit.data.datasets[0].data.push(currentGenerationDuration);
    vizfit.data.datasets[1].data.push(NNcomplexity);
    vizfit.update();

    document.getElementById("generation").textContent = neat.generation + 1;
    
    // automatically set generation duration to the avg. of last 3 generations + 50%

    if (autoDuration) {
        const d = vizfit.data.datasets[0].data;
        var c = 0, l = 0;
        for (let i = max (d.length - 4, 0); i < d.length; i++) {
            c += d[i];
            l++;
        }
        CYCLES_PER_GENERATION = Math.floor(c / l * 1.5);
        document.getElementById('cycles').textContent = CYCLES_PER_GENERATION;
    }

    //reset frame countdown
    
    cyclesLeft = CYCLES_PER_GENERATION;
    currentGenerationDuration = 0;

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
