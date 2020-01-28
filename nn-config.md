# Inputs of the fish brain
- 1st node: density of food in the vicinity of the fish
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
- 3: turn right
- 4: turn left

# Fish workflow in a given cycle

## Now

--> obj
        live()
            move() 

--> critter
        super.live ()
        *think ()*
        *act()*
        eat food
        expend energy on bodily functions
        die if too small

## Then

think()
    collect inputs
    activate network
    record output

act()
    interpret output
        pulse
        split
        turn

    decide if the action is not limited by the physique of the fish

    do action