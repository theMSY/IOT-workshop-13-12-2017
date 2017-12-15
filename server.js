const express = require('express');
const galileo = require('galileo-io');
const five = require('johnny-five');

// run "npm install -g cors" before running the server
const cors = require("cors");

// Initializing the board

var board = new five.Board({
    io: new galileo()
});

// Instantiate the server
const app = express();
app.use(cors());
// Instantiate the sensors
var soundSensor = new five.Sensor("A0");
var temperatureSensor = new five.Sensor("A1");
var lightSensor = new five.Sensor("A2");
var led = new five.Led(13);
var buzzer = new five.Led(7);
var button = new five.Button(4);
var B = 3975;
var seuilLum = 750;
var etat = "1";
var seuilTemp = 20;
var buzzeron = false;
var lighton = false;

button.on("hold", function() {
    etat = (etat === "1") ? "0" : "1";
});

var lcd = new five.LCD({
    controller: "JHD1313M1"
});


var interval = setInterval(
    function () {
        printData()
    }, 500
);
setInterval(function () {

    if (etat === "1") {
        if (buzzeron === true) {
            buzzer.on();
            return;
        }
        if (getTemp() > seuilTemp) {
            buzzer.on();
        }
        else {
            buzzer.off();
        }
    } else {
        buzzer.off();
    }
}, 500);

setInterval(function () {

    if (etat === "1") {
        if (lighton === true) {
            led.on();
            return;
        }
        if (lightSensor.value > seuilLum) {
            led.blink(100);
        }
        else {
            led.stop();
            led.off();
        }
    } else {
        led.stop();
        led.off();
    }
}, 500);


function printData() {
    lcd.clear();
    lcd.bgColor("#ffffff");
    lcd.cursor(0, 0).print("Temp : " + (etat === "1" ? getTemp() : "0"));
    lcd.cursor(1, 0).print("Light: " + (etat === "1" ? lightSensor.value : "0"));
}


/*app.get('/send/:msg', function (req, res) {

    res.send("message is : " + req.params.msg);
    lcd.clear().print(req.params.msg);
});*/


app.get('/', function (req, res) {
    res.send('Hello World!')
});


app.get('/ledon', function (req, res) {
    res.send('Led is On');
    lighton = true;
    led.on();
});

app.get('/ledoff', function (req, res) {
    res.send('Led is Off');
    lighton = false;
    led.stop();
    led.off();

});

app.get('/buzzeroff', function (req, res) {
    res.send('buzzer is Off');
    buzzeron = false;
    //led.stop();
    buzzer.off();

});


app.get('/buzzeron', function (req, res) {
    res.send('buzzer is On');
    buzzeron = true;
    buzzer.on();

});




app.get('/card/:etat', function (req, res) {
    res.send('card is ' + (req.params.etat === "1" ? 'On' : 'Off'));
    etat = req.params.etat;
    console.log(etat);
    clearInterval(interval);
    interval = setInterval(
        function () {
            printData()
        }, 500
    );
});

app.get('/seuil/lum/:val', function (req, res) {
    res.send("done");
    seuilLum = req.params.val;
    console.log(seuilLum);
});

app.get('/seuil/temp/:val', function (req, res) {
    res.send("done");
    seuilTemp = req.params.val;
    console.log(seuilTemp);
});

function getTemp() {
    var read = temperatureSensor.value;
    var resistance = (1023 - read) * 10000 / read;

    // Calculate the temperature based on the resistance value.
    return 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;
}

app.get("/getData", function (req, res) {
    var temperature = getTemp();
    return res.send({
        temp: etat === '1' ? temperature : 0,
        etat: etat,
        lum: etat === '1' ? lightSensor.value : 0,
        ip: "172.18.18.47"
    });
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});