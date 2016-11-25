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
var pads = [];
var messages;

//: Message object
function Message(text, r, g, b, posX, posY, fontSize) {
    var message = {
        text: text
        , r: r
        , g: g
        , b: b
        , x: posX
        , y: posY
        , textSize: fontSize
    };
    return message;
}
//Pad object
function Pad(r, posX, posY, value, soundPath) {
    var pad = {
        length: 100
        , x: posX
        , y: posY
        , value: value
        , color_R: r
        , sound: loadSound(soundPath)
    };
    return pad;
}
//: Initializes the array with pads
function initializePads() {
    var tempX = 10;
    var tempY = 150;
    var padValue = 32;
    var i, j;
    var counter = 0;
    for (i = 0; i < 4; i++) {
        tempX = 10;
        for (j = 0; j < 4; j++) {
            if (padValue == 40) {
                padValue = 44;
            }
            counter++;
            var padObj = Pad(0, tempX, tempY, padValue, "../drumkit/" + counter+".wav");
            pads.push(padObj);
            tempX += 120;
            padValue += 1;
        }
        tempY += 120;
    }
}

function printOutPadsArray() {
    for (var i = 0; i < pads.length; i++) {
        console.log(pads[i]);
    }
}

function preload() {
    messages = [Message("Could not connect to MIDI peripherals...Try again", 255, 0, 0, 5, 100, 13)
                , Message("Term 1 Project - wtyzi001", 0, 0, 0, 5, 30, 20)
                , Message("Introduction to Programming", 0, 0, 0, 5, 50, 13)
                , Message("Goldsmiths, University of London", 212, 175, 55, 5, 70, 13)];
    initializePads();
}
//: Function draws message from object
function drawMessageObject(msg) {
    fill(msg.r, msg.g, msg.b);
    textSize(msg.textSize);
    text(msg.text, msg.x, msg.y);
}
//: Function activated if connection was successful
function onConnectSuccess() {
    var inputs = zMIDI.getInChannels();
    if (inputs.length === 0) {
        drawMessageObject(messages[0]);
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
            //: When pad is pressed, change its colour and play the sound
            for (var j = 0; j < pads.length; j++) {
            if (pads[j].value == event.value) {
                pads[j].color_R = 255;
                pads[j].sound.play();
            }
        }
        break;
    case zMIDIEvent.NOTE_OFF:
        msg = "note off event value: " + event.value + " @ velocity " + event.velocity;
        //: When pad is released, change its colour and stop playing the sound
        for (var j = 0; j < pads.length; j++) {
            if (pads[j].value == event.value) {
                pads[j].color_R = 0;
                pads[j].sound.stop();
            }
        }
        break;
    case zMIDIEvent.CONTROL_CHANGE:
        msg = "CC event value: " + event.velocity;
        break;
    default:
        msg = "zMIDIEvent type : " + event.type + " with value " + event.value;
        break;
    }
    messages[4] = Message(msg + " coming in on channel " + event.channel, 255, 0, 0, 5, 125, 15);
    background(250, 200, 200);
    drawMessageObject(messages[4]);
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
    printOutPadsArray();
}
//: Draw function
function draw() {
    drawTitle();
    if (connected == false) {
        connectionButtonClicked();
    }
    else {
        drawPadObjects(pads);
    }
    if (messages[5] != null) {
        drawMessageObject(messages[5]);
    }
}
//: Function draws title in top left corner
function drawTitle() {
    drawMessageObject(messages[1]);
    drawMessageObject(messages[2]);
    drawMessageObject(messages[3]);
}
//: Function draws a connection button
function drawConnectionButton() {
    fill(0, 100, 200);
    rect(250, 15, 150, 55);
    textSize(20);
    fill(0, 0, 0);
    text("Click to connect", 255, 50);
}
//: Function activated if user clicked on connection button
function connectionButtonClicked() {
    if ((mouseX > 250 && mouseX < 400) && (mouseY > 15 && mouseY < 70) && mouseIsPressed) {
        zMIDI.connect(onConnectSuccess, console.log("connection error"));
    }
}

function drawPadObjects() {
    pads.forEach(function (index) {
        fill(index.color_R, 0, 0);
        rect(index.x, index.y, index.length, index.length);
    });
}
