// declare fishbowl vars

var foods = [];
var critters = [];
var objs = [];
var foodDensity = [];
var stats = [];
var neat;
var NNcomplexity;

const SENSES = 4;
//const ACTIONS = 2;

var td = Array(21); // thought density tracking array for the viz

const FOOD_DENSITY_GRID_STEP = 20;
const FOOD_DENSITY_THRESHOLD = 20;

const FISH_PULSE_THRESHOLD = 0.5;
const FISH_PULSE_VELOCITY = 0.5;
const VISION_RANGE = 200;

var INITIAL_FOOD_AMOUNT = 50;

var FDG_WIDTH, FDG_HEIGHT;

var viz, vizfit;

// GA settings
var INITIAL_PLAYER_AMOUNT;
const MUTATION_RATE = 0.3;
const ELITISM_PERCENT = 0.1;

var VERBOSE = false;
var TRAINING_VISION = false;
var CYCLES_PER_FRAME = 1;
var CYCLES_PER_GENERATION = 2000;
var cyclesLeft = CYCLES_PER_GENERATION;
var currentGenerationDuration = 0;
var autoDuration = false;



function mouseClicked() {
    for (var i = 0; i < objs.length; i++) {
        if (objs[i]) objs[i].click(mouseX, mouseY);
    }

}


function setup() {
    var canvas = createCanvas(windowWidth, windowHeight - document.getElementById('topbar').offsetHeight - 22);
    canvas.parent('canvas');
    background("gray");
    colorMode(HSB, 100);

    INITIAL_PLAYER_AMOUNT = max (round (width * height / 150000), 3);

    initNeat();

    NNcomplexity = neat.population.reduce((acc, el) => Math.max(acc, el.nodes.length + el.connections.length), 0);
    td.fill(0);

    FDG_WIDTH = (round(width / FOOD_DENSITY_GRID_STEP)) + 1; // FDG = food density grid
    FDG_HEIGHT = (round(height / FOOD_DENSITY_GRID_STEP)) + 1;

    //add objects

    addObjects();

    // add charts
    var l = Array(21).fill(0);
    l = l.map ((v, i) => i * 10 - 100);
    
    viz = new Chart("viz", {
        type: "horizontalBar",
        data: {
            labels: l,
            datasets: [{
                label: "steering distribution, %",
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

function addObjects() {
    if (!TRAINING_VISION) {
        for (var i = 0; i < INITIAL_FOOD_AMOUNT; i++)
            objs.push(new Food(random() * width, random() * height));
        for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
            let o = new Critter(random() * width, random() * height, neat.population[i]);
            objs.push(o);
            o.color = i * 100 / INITIAL_PLAYER_AMOUNT;
        } 
    } else {
        objs.push(new Food(round(width / 2) + 50, round(height / 2 + random() * 100 - 50)));
        for (i = 0; i < INITIAL_PLAYER_AMOUNT; i++) {
            let o = new Critter(round(width / 2) - 50, height / 2, neat.population[i]);
            objs.push(o);
            o.color = i * 100 / INITIAL_PLAYER_AMOUNT;
            o.size = 10;
            o.movement.x = 1;
            neat.population[i].score = 0;
        } 
    }
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

        objs.filter(obj => obj instanceof Critter).forEach(obj => td[Math.floor((obj.thought + PI / 8) / (PI / 4) * 20)]++);

        currentGenerationDuration++;

        // new generation

        if ((--cyclesLeft / CYCLES_PER_FRAME <= 0) || (objs.filter(obj => obj instanceof Critter).length <= 1))
            newGeneration();


    }

    //draw everything

    background(TRAINING_VISION ? "yellow" : "gray");
    objs.forEach(obj => obj.draw())
    viz.update();

}

function newGeneration()

{

    //evaluation

    if (!TRAINING_VISION)
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

    addObjects();
    
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

    if (TRAINING_VISION)
        cyclesLeft = 200
    else {
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
        cyclesLeft = CYCLES_PER_GENERATION;
    }

    //reset frame countdown
    
    currentGenerationDuration = 0;

}

function initNeat() {

    try {
        let p = localStorage.getItem("population");
        neat = new carrot.Neat();
        neat.fromJSON(JSON.parse(p));
        neat.resize(INITIAL_PLAYER_AMOUNT);

        console.log("Neural network population imported from the previous session");
        return;
    } catch (e) {
        console.log(e);
        console.log("Importing neural network population failed, creating a random one")
    };

    resetNeat();
}

function resetNeat() {
    neat = new carrot.Neat(SENSES, 1, null, {
        population_size: INITIAL_PLAYER_AMOUNT,
        mutation_rate: MUTATION_RATE,
        elitism: ELITISM_PERCENT * INITIAL_PLAYER_AMOUNT
    });
}

function loadPretrained () {
    var p = "[{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BENT_IDENTITY\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":null},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null},{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":4},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null},{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":null},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":null},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null},{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null},{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":null},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":null},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":null},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null},{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null},{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":null},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null},{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":4},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null},{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1},{\"nodes\":[{\"bias\":-0.2337443008327158,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":0},{\"bias\":-0.1105148635513662,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":1},{\"bias\":-0.8267267088628523,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":2},{\"bias\":-0.8729028071629745,\"type\":\"input\",\"squash\":\"LOGISTIC\",\"mask\":1,\"index\":3},{\"bias\":0.3971788281866946,\"type\":\"output\",\"squash\":\"BIPOLAR_SIGMOID\",\"mask\":1,\"index\":4}],\"connections\":[{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null},{\"weight\":1,\"from\":4,\"to\":4,\"gater\":null},{\"weight\":0.8166225131028566,\"from\":3,\"to\":4,\"gater\":4},{\"weight\":-0.9944322883272704,\"from\":2,\"to\":4,\"gater\":null},{\"weight\":0.4602784239657471,\"from\":1,\"to\":4,\"gater\":null},{\"weight\":-0.6012840565482216,\"from\":0,\"to\":4,\"gater\":null}],\"input_nodes\":[0,1,2,3],\"output_nodes\":[4],\"input_size\":4,\"output_size\":1,\"input\":4,\"output\":1}]"

    neat = new carrot.Neat();
    neat.fromJSON(JSON.parse(p));
    neat.resize(INITIAL_PLAYER_AMOUNT);

}