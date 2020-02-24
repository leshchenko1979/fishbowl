# fishbowl
Simulating evolution of fish intelligence in a fishbowl using neuroevolution / genetic algorithms.

See it in action: https://leshchenko1979.github.io/fishbowl/

# How it works

## The fish
The fish are placed in an aquarium with a randomly initiated neural network serving as their brain. The fish grow by consuming the food they bump into. 

The fish can:
- do nothing, 
- pulse (increase their speed like a jellyfish would do), 
- turn left/right or 
- split (when they are big enough to produce an offspring). 

However, every cycle the fish expend their energy (and lose their weight) on thinking, breathing etc. - and even more so when they move. When the fish is too small, it dies, turning into food.

## The food

The fishbowl also contains food (plankton), which grows on its own and splits into two pieces when it's big enough.

## The simulation

The program will run the simulation until all the fish but one die. At this point the simulation resets and another generation of fish is put in to the fishbowl, derived from the most successful fish from the previous generation.

You can witness the changes in the fish behaivor as the neural network evolves. The evolution is also shaped by the initial food amount and the duration of the simulation of each generation.

# Features

- Genome is stored into the browser cache to allow for restoring the evolution from where it stopped when the browser was reloaded.
- Statistics (distribution of neural network responses, complexity of the neural network and generation durations) are displayed.
- You can adjust the simulation speed, maximum generation duration and initial amount of food.

# How the fish brain works

The fish brain uses LiquidCarrot package which is a Javascript implementation of the NEAT algorithm for fast neuroevolution and self-developing neural network topology.

- LiquidCarrot: https://github.com/liquidcarrot/carrot
- NEAT: https://www.oreilly.com/radar/neuroevolution-a-different-kind-of-deep-learning/

## Inputs of the fish brain
- 1st node: speed of the fish
- 2nd node: size of the fish
- 3rd node: vision - density of food in the line of sight of the fish
- 4th node: smell - density of food in the vicinity of the fish

## Outputs of the fish brain
One node containing (after being squashed with logistic function):
- 0: do nothing
- 1: pulse
- 2: split
- 3: turn right
- 4: turn left

# Observed evolutionary phenomena
- When the food is enough, the fish start moving in distorted circular patterns, trying to collect all the food around them. Food abundance also promts more splitting.
- When there is less food, it is more rational for the fish to just go straight, bouncing off the walls. They also stop reproducing.
- When the food is very scarce, the best strategy for the fish turns out to be just staying at one place and peacefully die. Since moving leads to energy/weight expenditure and given the scarcity of food, does not lead to weight increase, those fish that don't move become the fittest and survive all the moving ones.
- It's also interesting to see how a strategy that has evolved in shorter generation durations becomes ineffective once the duration is increased, or vice versa.

# Ideas for future development 

## Fish farmers' tournament 

People should be able to upload genomes they have developed and make them compete against each other. The winner is the genome whose descendants have lived the longest. 

This will probably require introduction of two new senses - the density of friendlies and the density of enemies around the current fish. 

## Goal of the game
Farmers use finite simulation time, measured in seconds, to produce the fittest possible genome.

The farmers use simulation settings to speed up learning or to save simulation time. 

Farmers unlock simulation settings as they progress through the game. 

The progress is measured by *calibration* - a process where the current best genome is pitted against a benchmark. The benchmark can be either this farmer's past genomes, a genome from the game's bank, or other players' genomes. A successful calibration gives the player game currency. 

Game currency may be spent:
- to buy simulation time
- to buy new simulation stats and settings
- to buy new fish senses and actions
- to enter new calibrations
- to enlarge fish brains so that new, more complex behavior becomes possible. 

# Setting ideas
Setting |Fish are|Food are|Notes
---|---|---|---
Antibiotics lab|Antibodies / Nanobots|Viruses and bacteria. They can fight back, move away or be toxic. |Game currency is real currency you use to buy samples and equipment. Calibration is an assessment you have to pass to receive more funding. 
Colonization lab|Terraforming bacteria|Native elements / wildlife|Currency and calibration the same as in Antibiotics lab. Some stages will require building new bacteria that consume the bacteria that you have produced at previous stages. 

# Setting ideas in more detail
## Antibiotics lab
### Assignment parameters
- *Simulation time*. Sometimes urgent assignments may come that will require completion witin alloted time.
- *Eradication time*. The antibodies have to eradicate all enemies in a given timeframe.
- *Solution*. The antibodies have to keep the bacteria density within certain boundaries. 
- *Careful*. Must not bump the boundaries of the simulation field or other objects placed inside the simulation field. 

### Bacteria properties
- Can't be eaten when above a certain size
- *Age* at which a bacterium dies / Otherwise *immortal*
- *Toxicity*. The bacteria emit toxins. The more bacteria exist, the more toxins are emitted. The host may die when the total toxins emitted are above a certain threshold. 

### Antibodies' properties
- Dies when reaches a certain age
- Sense
- Vision

### Lab equipment
- *Storage* lets you start evolution from the results of earlier stages