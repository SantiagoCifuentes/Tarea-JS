(function()
{
        self.Board = function(width,height){ //preguntar porqué se definen los objetos desde acá y no desde el nombre de la función
        this.width = width;
        this.height= height
        this.playing = false;
        this.game_over= false;
        this.bars = [];
        this.ball= null;
        this.playing = false;
    }

    self.Board.prototype = 
    {
       get elements ()  
       {
           var elements = this.bars.map(function(bar){ //el map permite iterar los elementos de un array, modificarlos y construir uno nuevo
               return bar;
           });
           elements.push(this.ball);
           return elements;
       } //retorna las barras y las pelotas del juego
    }
})();


(function(){
    self.Ball=function(x,y,radius,board){
        this.x= x;
        this.y =y ;
        this.radius=radius;
        this.board=board;
        this.speed_y=0;
        this.speed_x=3;
        this.board;
        this.direction = 1;
        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI / 12;
        this.speed=3 
        board.ball = this; //se asgina la variable ball creada en la funcion board
        this.kind= "circle"; //tipo de figura según canvas

   

    }
    self.Ball.prototype = {
        move : function()
        {
            this.x+=(this.speed_x * this.direction);
            this.y+=(this.speed_y);
        },

        get width() //se le asigna estsa propiedades en esta función para poder implementar el método de colisiones
        {
            return this.radius *2;
        },

        get height()
        {
            return this.radius *2;
        },
        collision: function(bar)//reacciona a la colisión con una barra que recibe como parámetro. calcula el ángulo en que va a moverse la pelota
        {
            var relative_intersect_y = (bar.y + (bar.height/2)) - this.y;

            var normalized_intersect_y = relative_intersect_y / (bar.height/2);

            this.bounce_angle= normalized_intersect_y * this.max_bounce_angle;

            this.speed_y = this.speed * -Math.sin(this.bounce_angle);
            this.speed_x = this.speed * Math.cos (this.bounce_angle);

            if(this.x >(this.board.width/2)) 
                this.direction = -1

            else this.direction=1;
        }
    }
})();

(function()
{
    self.Bar= function(x,y,width,height,board)
    {
        this.x=x;
        this.y=y;
        this.width=width;
        this.width=width;
        this.height=height;
        this.board=board;       
        this.board.bars.push(this)//se pone con push para llenar el arreglo que se declaró en el objeto Board
        this.kind = "rectangle"; //el tipo de barra
        this.speed = 10;
    }

    self.Bar.prototype = 
    {
        down: function()
        {
            this.y += this.speed;
        },
        up:function()
        {
            this.y -= this.speed;
        },

        toString: function()
        {
            return "x: " + this.x + " y: " + this.y ;
        }

    }
}());



(function()//esta funcion es la que dibujará todo en el navegador
{
    self.BoardView=function(canvas,board)
    {
        this.canvas= canvas;
        this.canvas.width= board.width
        this.canvas.height=board.height
        this.board = board
        this.context= canvas.getContext("2d");
    }

    self.BoardView.prototype={
        clean: function() {
            this.context.clearRect(0,0,this.board.width,this.board.height);
        },

       
        draw:function(){
            for (var i = this.board.elements.length - 1;i>=0;i--) //forma de recorrer un arreglo por los de codigofacilito, lo intenté hacer de manera normal pero no me dio
            {
               var ele= this.board.elements[i];
                
               draw(this.context,ele)
            }
        },

        check_collisions: function()
        {
            for (var i=this.board.bars.length-1; i>=0;i--) {
                var bar = this.board.bars[i];

                if(hit(bar,this.board.ball))
                {
                    this.board.ball.collision(bar);
                }
            }
        },

        //este método se agregó para ahorrar código, antes se llamaban estas dos funciones desde el controlador
        play:function(){
            if (this.board.playing) { 
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move()
            }
            
        }

    }

    function hit(a,b)//evalúa si a colisiona ocn b
    {
        var hit = false ;
        //colisiones horizontales
        if(b.x + b.width >= a.x && b.x< a.x + a.width)
        {
            //colisiones horizontales
            if(b.y + b.height >= a.y && b.y<a.y+a.height)
            {
                hit = true
            }

        }

        //colisión de a con b 
        if(b.x <=a.x  && b.x +b.width>= a.x + a.width)
        {
            if(b.y<=a.y && b.y+b.height >= a.y + a.height)
                hit = true;
        }

           //colisión de b con a 
        if(a.x <=b.x  && a.x +a.width>= b.x + b.width)
        {
            if(a.y<=b.y && a.y+a.height >= b.y + b.height)
                hit = true;
        }
        return hit

    }


    
    function draw(context,element)
    {
        
     switch(element.kind) //dependiendo del tipo de elemento, kind lo dibujará de X forma
        {
            case "rectangle":
                context.fillRect(element.x,element.y,element.width,element.height)//fillRect es una funcion de la clase contexto que permite dibujar un cuadrado,los parámetros son de la clase fill rect, no se están llamando de otra función
            break;

            case "circle":
                context.beginPath();
                context.arc(element.x,element.y,element.radius,0,7);
                context.fill();
                context.closePath();
            break;
        
        }
        
        
    }

})();

//se ponen acá para que la funcion ev pueda acceder a las barras
var board = new Board(800,400)//weigh and height
var bar = new Bar(20,100,40,100,board)
var bar_2 = new Bar(735,100,40,100,board)
var canvas = document.getElementById('canvas');
var board_view= new BoardView(canvas,board);
var ball = new Ball(350,100,10,board)



document.addEventListener("keydown",function(ev) //evento keydown,cuando suceda el keydown, se ejecuta la funcion
{
    console.log(ev.keyCode)
    if(ev.keyCode == 38)
    {
        ev.preventDefault();
        bar.up();
    }
 
    else if(ev.keyCode == 40)
    {
        ev.preventDefault();
        bar.down();
    }

    else if(ev.keyCode === 87)
    {
        ev.preventDefault();
        bar_2.up();
    }

    else if(ev.keyCode === 83) // no entendí bien porqué se igualan a estos valores
    {
        ev.preventDefault();
        bar_2.down();
       
    }

   else if (ev.keyCode ===32) 
   {
    ev.preventDefault();
    board.playing = !board.playing // es como un juego de falso y verdadero. se utiliza para simular una pausa
   }

});

//self.addEventListener("load",main);
board_view.draw()

window.requestAnimationFrame(controller)//pasa a los siguientes frame, en este caso sería 
setTimeout(function()
{
    ball.direction= -1 ;
},4000)

function controller()
{
    window.requestAnimationFrame(controller)
    board_view.play();
    
}

