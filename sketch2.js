let song, analyzer;
let clap;
let playing = false;
let bgc = "";
let dia = 5;
let particles = [];
let num = 100;
let r,g,b;
let rms;
let mic, buffer;

window.onload = function (){
    const pane = new Tweakpane.Pane({
        title: "Paramerers",
        expanded: true,
    });

    const params = {
        message: "press space to play/pause, c to clap!!!",
        diameter: 5,
        particle_color: "hsl(200,74%,44%)",
    };
    pane.addInput(params, "message").on("change",(value) =>{
        console.log(value);
    });
    pane.addInput(params, "diameter", {min: 0, max: 30, step: 0.1}).on("change", (value) =>{
        dia = value.value;
    });
    pane.addInput(params, "particle_color", {h:255, s:255, l:255}, "hsl").on("change", (value) =>{
        let parts = split(value.value, ',');
        for (let i = 0; i < parts.length; i++) {
            parts[i] = parts[i].replace(/\D/g, '');
        }
        bgc = color(parts[0], parts[1], parts[2], parts[3]);
        console.log(bgc);
    });
};

function preload() {
    song = loadSound('disco yes.mp3');
    song.setVolume(0.35);
    clap = loadSound('clap.mp3');
    clap.setVolume(1);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    // create a new Amplitude analyzer
    analyzer = new p5.Amplitude();
    // Create a new microphone input
    mic = new p5.AudioIn();
    mic.start();
    colorMode(HSB, 360, 100, 100, 255);
    r = 255;
    b = 255;
    g = 255;
    let x = random(-5, 5);
    let y = random(-5, 5);
    for (let i = 0; i < num; i++) {
        let v = createVector(random(width), random(height));
        let d = createVector(x,y);
        let c = color(map(v.x, 0, width, 0, 360), 100, 100);
        particles[i] = new Particle(v, d, c, dia);
    }

    stroke(255);
    noStroke();
}

function keyPressed(){
    if(key === ' '){
        playing = !playing;
        if (playing){
            song.loop();
            // Patch the input to an volume analyzer
            analyzer.setInput(song);
        }else{
            song.pause();
        }
    }
    if(key === 'c'){
        clap.play();
    }
}

function onScreen(v){
    if(v.x>0&&v.x<width&&v.y>0&&v.y<height){
        return true;
    }else{
        return false;
    }
}

function draw() {
    background(0,3);
    r+=random(-5,5);
    b+=random(-5,5);
    g+=random(-5,5);
    for(let i = 0; i < num; i++){
        fill(bgc);
        stroke(bgc);
        noStroke();
        particles[i].display();
        particles[i].move();
    }
    if(r>255||r<0) {
        r=random(0,200);
    }
    if(g>255||g<0){
        g=random(100,200);
    }
    if(b>255||b<0){
        b=random(0,255);
    }
    stroke(r,g,b, 255);
    strokeWeight(10);
    rms = analyzer.getLevel();
    if(analyzer.length>61){
        analyzer.pop();
    }
    buffer = mic.getLevel() * 10;
    fill(r,g,b, 255);
    let d = map(rms, 0, 1, 200, height);
    // Draw an ellipse with size based on volume
    ellipse(width / 2, height / 2, 1.323*d, 1.21*d);
    ellipse(0, height/2, d, d);
    ellipse(width, height/2, d, d);
}


class Particle{
    constructor(pos, dir, col, dia) {
        this.pos = pos;
        this.dir = dir;
        this.col = col;
        this.dia = dia;
    }
    move() {
        let n = noise(this.pos.x * random(0.01, 0.1), this.pos.y * random(0.01, 0.1) );
        let a = TAU * n * -1;
        let new_rms = rms * 1.2;
        this.pos.x += sin(a) * mouseX/width * new_rms * 50 * (0.3+buffer) * 10;
        this.pos.y += cos(a * a) * mouseY/height * rms * 50 * (0.3+buffer) * 33 ;
        if(!onScreen(this.pos)){
            this.col = color(bgc);
            this.pos.x = random(width);
            this.pos.y = random(height/3, height*2/3) + random(-100,100);
        }
        this.dia = dia;
    }
    display() {
        fill(this.col);
        circle(this.pos.x, this.pos.y, this.dia);
    }
}