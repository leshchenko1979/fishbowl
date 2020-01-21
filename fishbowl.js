var foods = [];
var critters = [];
var objs = [];
var foodDensity = [];
var stats = [];

function mouseClicked () {
		for (var i = 0; i < objs.length; i++) { 
			if (objs[i]) objs[i].click (mouseX, mouseY);
		}

}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);

	//add objects
	
	for (var i = 0; i < 100; i++)
			objs.push(new Food(random() * windowWidth, random() * windowHeight));

	for (var i = 0; i < 10; i++)
			objs.push(new Critter(random() * windowWidth, random() * windowHeight));
}

function draw() {
	background(100);
	
	//calculate food density
	foodDensity = Array (((windowWidth / 10 >> 0) + 1) * (windowHeight / 10 >> 0) + 1);
	foodDensity.fill (0);
	objs.forEach (obj => {
		if (obj.constructor.name == "Food") 
			foodDensity[round(obj.getPosition().x / 10) * ((windowWidth / 10 >> 0) + 1) + round(obj.getPosition().y / 10)] += obj.getSize();
	});
		
	//main cycle
	
