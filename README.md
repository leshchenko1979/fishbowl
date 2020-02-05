# fishbowl
Simulating evolution of fish intelligence in a fishbowl using neuroevolution / genetic algorithms.

# Inputs of the fish brain
- 1st node: density of food in the vicinity of the fish *(disabled)*
- 2nd node: speed of the fish
- 3rd node: size of the fish

## Additional senses on later evolution stages
- 4th node (vision): Density of *food* in the +-45 degree cone of the fish
- 5th node (vision): Number of *fish* in the +-45 degree cone of the fish

# Outputs of the fish brain
One node containing:
- 0: do nothing
- 1: pulse
- 2: split
- 3: turn right *(disabled)*
- 4: turn left *(disabled)*

# Fish workflow in a given cycle
- think ()
  - collect inputs
  - activate network
  - record output
- act()
  - interpret output
    - pulse?
    - split?
    - turn?
  - decide if the action is not limited by the physique of the fish
  - do action
- eat food
- expend energy on bodily functions
- die if too small
- move() 

# Generation cycle

## Generations synchronized, mutations occur only on respawn

### Fitness function

Size of all fishes sharing this brain after X frames + max witnessed total size of all fishes sharing this brain 

### Cycle description

0. spawn initial population
1. when a fish splits, new fish refers to the same brain as the parent
2. wait until all fish die off or X frames have passed
    - record maxTotalFishSize for each brain in the process
3. evolve()
4. go to 1

## Mutations occur when fish split and on respawn - *current NEAT module from neataptic is not adapted to this task*

0. spawn new generation (several fishes)
    - parents are selected from where?
1. when a fish splits, new fish receive new genomes
    - will the brain be inserted in the same generation or a new one?
      - same: easier to select parents on respawn (but not on split)
      - new: too many generations, the system may break
    - how will the parents be determined?
      - can the population be produced from a single parent?
2. wait until all fish die off
3. go to 1