# fishbowl
Simulating evolution of fish intelligence in a fishbowl using neuroevolution / genetic algorithms.

See it in action: https://leshchenko1979.github.io/fishbowl/

# How it works

## The fish
The fish are placed in an aquarium with a randomly initiated neural network serving as their brain. The fish grow by consuming the food they bump into. 

The fish can:
- pulse (increase their speed like a jellyfish would do) - *done automatically*, 
- split (when they are big enough to produce an offspring) - *done automatically* or
- turn left/right. 

However, every cycle the fish expend their energy (and lose their weight) on thinking, breathing etc. - and even more so when they move. When the fish is too small, it dies, turning into food.

## The food

The fishbowl also contains food (plankton), which grows on its own and splits into two pieces when it's big enough.

## The simulation

The program will run the simulation until all the fish but one die. At this point the simulation resets and another generation of fish is put in to the fishbowl, derived from the most successful fish from the previous generation.

You can witness the changes in the fish behaivor as the neural network evolves. The evolution is also shaped by the initial food amount and the duration of the simulation of each generation.

# Features

- Genome is stored in the browser cache to allow for restoring the evolution from where it stopped when the browser was reloaded.
- Statistics (distribution of neural network responses, complexity of the neural network and generation durations) are displayed.
- You can adjust the simulation speed, maximum generation duration and initial amount of food.
- Vision training mode - simplified environment conditions to speed up vision / movement coordination of the fish

# How the fish brain works

The fish brain uses LiquidCarrot package which is a Javascript implementation of the NEAT algorithm for fast neuroevolution and self-developing neural network topology.

- LiquidCarrot: https://github.com/liquidcarrot/carrot
- NEAT: https://www.oreilly.com/radar/neuroevolution-a-different-kind-of-deep-learning/

## Inputs of the fish brain
- 1st node: speed of the fish
- 2nd node: smell - density of food in the vicinity of the fish
- 3rd node: distance to the closest food piece in the fish's vision cone
- 4th node: anle to that food piece

## Outputs of the fish brain
One node containing the rotation angle of the fish.

# Observed evolutionary phenomena
- When the food is enough, the fish start moving in distorted circular patterns, trying to collect all the food around them. Food abundance also promts more splitting.
- When there is less food, it is more rational for the fish to just go straight, bouncing off the walls. They also stop reproducing.
- When the food is very scarce, the best strategy for the fish turns out to be just staying at one place and peacefully die. Since moving leads to energy/weight expenditure and given the scarcity of food, does not lead to weight increase, those fish that don't move become the fittest and survive all the moving ones.
- It's also interesting to see how a strategy that has evolved in shorter generation durations becomes ineffective once the duration is increased, or vice versa.