//kenny.nl/assets

var mp =(300);
var enemies = []
var vel = 4 //velocity of player. was originally assigned in a function changed on a whim
function startGame(){//starts game
	

	myGameArea.start();
	ctx = canvas.getContext("2d")
	player = new triangle(20,40,"images/tship.png",400,300,"image");//triangle(10,20,"red",340,300);
	enemy = new circle(15,"images/life.png",200,200,"image");
	pScore = new scoreBoard(0,650,50,0);//
	pLives = new scoreBoard(0,650,75,1);
	for(i=0;i<=mp ;i++){//creates an array of 300 objects, circles of radius 5 and each with a random color. and random position 0-6000 pixels above the canvas the large initial spawn area creates a dificulty curve as the circles get re-used.
		enemies[i] = new circle(5,"rgb("+Math.floor(Math.random() * 255)+","+Math.floor(100+Math.random() * 100)+","+Math.floor(100+Math.random() * 100)+")",Math.random()*800,Math.random()*-6000)
	}
	
}

var myGameArea = {//game area is an object
	//creates a canvas element
	start: function(){//method that starts the update interval and adds the event listener
		this.interval = setInterval(updateG,20);
		document.getElementById("myCanvas").innerHTML = '<canvas id = "canvas"></canvas>'
		canvas.width = 800;
		canvas.height = 600;
		addEventListener("keydown", function (e){// learned about this outside of class but thought it was a simple enough to keep the project. (look in report il explain the reasoning)
			myGameArea.key = (myGameArea.key || []); //if a key is already pressed then wont cancel initial input.
			myGameArea.key[e.keyCode] = true;
		})
		addEventListener("keyup",function(e){
			myGameArea.key[e.keyCode] = false;
		})
	},
	clear : function(){//clears the canvas
		ctx.clearRect(0,0,canvas.width,canvas.height);
	},
	stop : function(){//clears the interval and stops the game.
		clearInterval(this.interval);
		
	}
	
}
function updateG(){ //updates objects and clears canvas
	
	myGameArea.clear();
	
	//stops player movement
	player.speedX = 0;
	player.speedY = 0;
	
	//controls player with arrow keys
	if(myGameArea.key && myGameArea.key[80]){
		alert("paused");
		myGameArea.key[80] = false
	}
	//changes movement direction based on arrow keys
	if(myGameArea.key && myGameArea.key[37]){player.speedX =-vel}
	if(myGameArea.key && myGameArea.key[39]){player.speedX = vel}
	if(myGameArea.key && myGameArea.key[38]){player.speedY = -vel}
	if(myGameArea.key && myGameArea.key[40]){player.speedY = vel}
	
	//repurposed my initial enemy circle into a powerup left the object name as it was.
	if(enemy.crash(player)){//checks specific enemy to player collision
		if (player.life<=4){player.life ++}
		pScore.score += 500
		enemy.y = enemy.y-(600+(Math.random()*600))
				
	}
	
	for(i=0;i<=mp ;i++){//updates the set of enemy objects and checks collision
		if(i%2 == 0){enemies[i].speedX = 0}
		if(i%3 == 0){enemies[i].speedY = -enemies[i].speedY}
		enemies[i].newPos();
		enemies[i].update();
		if(enemies[i].crash(player)){//checks each object's collision with the player
			player.life --
			enemies[i].y = enemies[i].y-(600+(Math.random()*600))
			
			if (player.life == 0){//life count drops to 0 Game Over
				myGameArea.stop();
				ctx.strokeStyle = "red"
				ctx.font = "75px Arial"
				ctx.strokeText("YOU DIED",250,300)
				
			}
			
		}
	}
	//updates position and draws
	
	pScore.update();
	pLives.update();
	player.newPos();
	player.update();
	enemy.newPos();
	enemy.update();
	
}


//object constructor for rectangle shape.
function rectangle(width,height,color,x,y,type){
	this.type = type;
	if (type == "image"){// if image type then color parameter becomes image source
		this.image = new Image();
        this.image.src = color;
	}
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.x = x;
	this.y = y;
	this.update = function(){
		if(type == "image"){//if last parameter is image changes what is drawn
			 ctx.drawImage(this.image,this.x,this.y,this.width, this.height)
		}else{
		ctx.fillStyle = color;
		ctx.fillRect(this.x,this.y,width,height);	
		}
		
	}
	this.newPos = function(){//method to change position
		this.x += this.speedX;
		this.y += this.speedY;
	}
}
//triangle object constructor
function triangle(width,height,color,x,y,type){
	this.life = 1
	this.type = type;
	if (type == "image"){//same as before image turns color to source
		this.image = new Image();
        this.image.src = color;
	}

	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.radius = 10// 1/2rP = A radius only used to determine hitbox of object
	this.x = x;
	this.y = y;
	this.update = function(){
		if(type == "image"){
			ctx.drawImage(this.image,this.x-width,this.y-height,this.width*2,this.height)
		}else{
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.lineTo(this.x,this.y-height);
			ctx.lineTo(this.x-width,this.y);
			ctx.lineTo(this.x+width,this.y);
			ctx.lineTo(this.x,this.y-height);
			ctx.fill();	
		}
		
	}
	this.newPos = function(){
		if((this.x + this.speedX) >= 800-this.width || (this.x + this.speedX) <= 0+this.width ||(this.y + this.speedY) >= 600 || (this.y + this.speedY) <= 0+this.height){
			this.speedX = 0
			this.speedY = 0
		}
		this.x += this.speedX;
		this.y += this.speedY;
	}

}
//circle object constructor. same as same as before
function circle(radius, color, x,y,type){
	this.life = 1;
	this.type = type;
	if (type == "image"){
		this.image = new Image();
        this.image.src = color;
	}
	this.radius = radius;
	this.x = x;
	this.y = y;
	this.speedX = 2
	this.speedY = 2
	this.update = function(){
		if (this.life == 1){
			if (type=="image")
				ctx.drawImage(this.image,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2);
			else{
				ctx.beginPath();
				ctx.fillStyle = color;
				ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
				ctx.fill()
			}				
		}
	}
	this.newPos = function(){//bounds the circles to the canvas 
		if (this.life == 1){
			if(this.x >= 800 || this.x <= 0 ){this.speedX = -this.speedX; }//hitting the left\right sides of the canvas cause a change in direction
			if(this.y >= 600 ){
				this.y = this.y-(600+(Math.random()*600))//when off bottom of canvas moves to random position 600 pixels above canvas
				if(this.speedX == 0){this.x = Math.random()*800}// randomizes the position of the circles coming straight down.
				
				}
			this.x += this.speedX;
			this.y += this.speedY;
		}		
	}		
	this.crash = function(crush){//method to check collision takes object as a parameter
		if (this.life == 1){
			//a^2+b^2=c^2 if c < the length of both radi then collision
			var dx2 =(this.x - crush.x)*(this.x - crush.x)
			var dy2 =(this.y - (crush.y - 15 ))*(this.y - (crush.y-15))//-15 to compensate for the radius of the hitbox and that the (x,y) player coordinate isnt the middle of the triangle
			
			var dead = true;
			if(Math.sqrt(dx2+dy2) >= (this.radius + crush.radius)) {
				dead = false;
			}
			return dead;
		}
	}
}

function scoreBoard(score,x,y,state){//object constructor that creates a textfield. 
	this.score = score;
	this.x = x;
	this.y = y ;
	this.state = state;
	if(this.state == 0){
		this.update = function(){
			ctx.font = "25px Arial"
			ctx.fillText("score: "+(this.score+score),x,y)	
		}
		setInterval(scores,10)//score is determined by this timer + extra lives
			function scores() {
				score++;
		}
	}
	if(this.state == 1){
		this.update = function(){
			ctx.font = "25px Arial";
			ctx.fillText("Lives: "+player.life,x,y)
			
		}
	}
}

//in hindsight i could have done this project infinetly better. almost all my objects can be created with a single object constructor. and iv'e made a mess of where everything has been assigned.
//this is a result of me just adding more code onto the pile instead of digging out what i needed.