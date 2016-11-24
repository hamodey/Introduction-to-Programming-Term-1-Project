//: Import libraries
requirejs.config({
    baseUrl: "../src/"
    , urlArgs: "bust=" + Date.now()
});
require(["zMIDI", "zMIDIEvent", "MIDINotes"], function (zMIDI, zMIDIEvent, MIDINotes) {
    window.zMIDI = zMIDI;
    window.zMIDIEvent = zMIDIEvent;
    window.MIDINotes = MIDINotes;
});

//: Variables
var connected = false;

//: Object returns Message
function Message(text, r, g, b, posX, posY, fontSize) {
    var message = {
        text: text,
        r: r,
        g: g,
        b: b,
        x: posX,
        y: posY,
        textSize: fontSize
    };
    return message;
}

var messages;
function preload() {
    messages = [Message("Could not connect to MIDI peripherals...Try again", 255, 0, 0, 5, 100, 13),
                Message("Term 1 Project - wtyzi001", 0, 0, 0, 5, 30, 20),
                Message("Introduction to Programming", 0, 0, 0, 5, 50, 13),
                Message("Goldsmiths, University of London", 212, 175, 55, 5, 70, 13)];
}

//: Function draws message from object
function drawObjectMessage(msg) {
    fill(msg.r, msg.g, msg.b);
    textSize(msg.textSize);
    text(msg.text, msg.x, msg.y);
}

//: Function activated if connection was successful
function onConnectSuccess() {
    var inputs = zMIDI.getInChannels();
    if (inputs.length === 0) {
        drawObjectMessage(messages[0]);
    }
    else {
        var feedback = ""
            , i = -1;
        inputs.forEach(function (input) {
            feedback += input.manufacturer + " " + input.name;
            zMIDI.addMessageListener(++i, messageHandler);
        });
        textSize(13);
        fill(0, 120, 153);
        background(250, 200, 200);
        connected = true;
        text("Connected to: " + inputs[0].manufacturer + " " + inputs[0].name, 5, 100);
        messages[5] = Message("Connected to: " + inputs[0].manufacturer + " " + inputs[0].name, 0, 120, 153, 5, 100, 13);
    }
}
//: Function returns messages from the keyboard
function messageHandler(event) {
    var msg = "";
    switch (event.type) {
    case zMIDIEvent.NOTE_ON:
        var pitch = MIDINotes.getPitchByNoteNumber(event.value);
        msg = "note on event value: " + event.value + " ( note is " + pitch.note + pitch.octave + " @ " + pitch.frequency + "Hz ) " + "@ velocity " + event.velocity;
        break;
    case zMIDIEvent.NOTE_OFF:
        msg = "note off event value: " + event.value + " @ velocity " + event.velocity;
        break;
    case zMIDIEvent.CONTROL_CHANGE:
        msg = "CC event value: " + event.velocity;
        break;
    default:
        msg = "zMIDIEvent type : " + event.type + " with value " + event.value;
        break;
    }
    messages[4] = Message("received on MIDI port" + event.port + ": " + msg + " coming in on channel " + event.channel, 255, 0, 0, 5, 125, 15);
    background(250, 200, 200);
    drawObjectMessage(messages[4]);
}
//: Print out the message in html
function showMessage(aMessage) {
    document.getElementById("status").innerHTML += aMessage;
}
//: Setup function
function setup() {
    createCanvas(1366, 768);
    background(250, 200, 200);
    drawConnectionButton();
}
var titleStatus = false;

//: Draw function
function draw() {
    drawTitle();
    if (connected == false) {
        connectionButtonClicked();
    }
    if (connected == true) {
        drawPads();
    }

    if(messages[5] != null) {
        drawObjectMessage(messages[5]);
    }
}

function drawTitle() {
    drawObjectMessage(messages[1]);
    drawObjectMessage(messages[2]);
    drawObjectMessage(messages[3]);
}

function drawConnectionButton() {
    fill(0, 100, 200);
    rect(250, 15, 150, 55);
    textSize(20);
    fill(0, 0, 0);
    text("Click to connect", 255, 50);
}

function connectionButtonClicked() {
    if ((mouseX > 250 && mouseX < 400) && (mouseY > 15 && mouseY < 70) && mouseIsPressed) {
        zMIDI.connect(onConnectSuccess, alert("error"));
    }
}
    function drawPads() {
        fill(0, 0, 0);
        var length = 100;
        var tmpY = 150;
        var tmpX = 10;
        var space = 100;
        for (var i = 0; i < 4; i++) {
            tmpX = 10;
            for (var j = 0; j < 4; j++) {
                rect(tmpX, tmpY, length, length);
                tmpX += space + 20;
            }
            tmpY += space + 20;
        }
    }

    function keyboardButton(x, y, soundPath) {
        var obj = {
            length: 100
            , x: x
            , y: y
            , sound: loadSound(soundPath)
        };
        return obj;
    }
