function setup() {
  createCanvas(600, 400);
  connection();
  checkConnection();

}

function draw() {
}

function connection() {
  if(zMIDI().isSupported()) {
    fill(0, 180, 180)
    ellipse(100, 100, 150, 150);
    zMIDI().connect(printSuccess, printFailure);
  } else { 
    fill(255, 0, 0);
    ellipse(100, 100, 150, 150);
  }
}
function checkConnection() {
  if(zMIDI().isConnected()) {
    print("I'm connected!");
  } else {
    print("Could not connect!");
  }
}

function printSuccess() {
  var inputs = zMIDI().getInChannels();
  if(inputs.length === 0) {
    printFailure();
  }
  print("success");
}

function printFailure() {
  print("failure");
}