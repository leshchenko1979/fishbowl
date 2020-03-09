# Vision

## X-Ray
1. Take the vector which is as long as VISION-RANGE and is pointing along the fish movement axis. 
2. Add up sizes of all foods tha are closer to this vector then FOOD_DENSITY_GRID_SIZE, after dividing it by the distance from the fish to it and from the food to the vision vector.

## Food area sensing
1. Add up foodDensity in the -100~+100 square around the fish, after diving it by the square of distance to the corresponding square.

## Closest food in the vision cone - angle
1. Define vision cone.
2. Filter all food that lies within the cone.
3. Find the closest one.
4. Calculate the difference between fish heading and the direction to the food.

## Closest food in the vision cone - size
## Closest food in the vision cone - distance