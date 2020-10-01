'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    throw err;
  } else {
    client.on('error', function (err) {
      throw err;
    });

    // connect to the Edge instance
    client.open(function (err) {
      if (err) {
        throw err;
      } else {
        console.log('IoT Hub module client initialized');

        // Act on input messages to the module.
        client.on('inputMessage', function (inputName, msg) {
          setAlarmState(msg);
        });
      }
    });
  }
});

//This function set if there is an alarm or not
function setAlarm (msg){
  if(msg.concept == "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Temperature
    if(msg.value > 37.3 || msg.value < 35.6){
      sendAlarmMessage(msg);
    }
  } else if(msg.concept == "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Systolic BP
    if(msg.value > 120 || msg.value < 90){
      sendAlarmMessage(msg);
    }
  } else if(msg.concept == "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Diastolic BP
    if(msg.value > 80 || msg.value < 60){
      sendAlarmMessage(msg);
    }
  } else if(msg.concept == "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //SpO2
    if(msg.value > 100 || msg.value < 95){
      sendAlarmMessage(msg);
    }
  } else if(msg.concept == "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Pulse
    if(msg.value > 100 || msg.value < 60){
      sendAlarmMessage(msg);
    }
  } else if(msg.concept == "5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Respiratory Frequency
    if(msg.value > 18 || msg.value < 12){
      sendAlarmMessage(msg);
    }
  }
}
// This function send the alarm messages to telegram
function sendAlarmMessage(msg){
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.telegram.org/" + "AlarmBot" + "/sendMessage",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "cache-control": "no-cache"
    },
    "data": JSON.stringify({
      "chat_id": chat_id,
      "text": "ALARM IN PATIENT: " + msg.patient + " \n Alarm in Concept: " + msg.concept + "\n With value: " + msg.value
    })
  }
  $.ajax(settings).done(function (response) {
    console.log(response);
  });
}
