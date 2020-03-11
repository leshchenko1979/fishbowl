
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