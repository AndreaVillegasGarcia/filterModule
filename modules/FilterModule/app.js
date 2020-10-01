'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;
var cont = 0;
var Tempvalues = [];
var Pulsevalues = [];
var SpO2values = [];
var SysBPvalues = [];
var DiastBPvalues = [];
var RespFreqvalues = [];

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
          setAlarm(msg, client);
          if (this.cont < 180){
            this.cont++;
            if(msg.concept == "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
              //Temperature
              this.Tempvalues.add(msg.value)
            } else if(msg.concept == "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
              //Systolic BP
              this.SysBPvalues.add(msg.value)
            } else if(msg.concept == "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
              //Diastolic BP
              this.DiastBPvalues.add(msg.value)
            } else if(msg.concept == "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
              //SpO2
              this.SpO2values.add(msg.value)
            } else if(msg.concept == "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
              //Pulse
              this.Pulsevalues.add(msg.value)
            } else if(msg.concept == "5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
              //Respiratory Frequency
              this.RespFeqvalues.add(msg.value)
            }
          } else {
            this.cont = 0;
            genAndSendAvgMessage(this.Tempvalues);
            genAndSendMinMessage(this.Tempvalues);
            genAndSendMaxMessage(this.Tempvalues);
            this.Tempvalues = [];
            genAndSendAvgMessage(this.DiastBPvalues);
            genAndSendMinMessage(this.DiastBPvalues);
            genAndSendMaxMessage(this.DiastBPvalues);
            this.DiastBPvalues = [];
            genAndSendAvgMessage(this.SysBPvalues);
            genAndSendMinMessage(this.SysBPvalues);
            genAndSendMaxMessage(this.SysBPvalues);
            this.SysBPvalues = [];
            genAndSendAvgMessage(this.Pulsepvalues);
            genAndSendMinMessage(this.Pulsepvalues);
            genAndSendMaxMessage(this.Pulsepvalues);
            this.Pulsepvalues = [];
            genAndSendAvgMessage(this.RespFreqvalues);
            genAndSendMinMessage(this.RespFreqvalues);
            genAndSendMaxMessage(this.RespFreqvalues);
            this.RespFeqvalues = [];
            genAndSendAvgMessage(this.SpO2values);
            genAndSendMinMessage(this.SpO2values);
            genAndSendMaxMessage(this.SpO2values);
            this.SpO2values = [];
          }
        });
      }
    });
  }
});

//Generate and Send an Average Message
function genAndSendAvgMessage (values){
  var message = {
    "concept": msg.concept,
    "person": msg.patient,
    "obsDatetime": msg.obsDatetime,
    "encounter": msg.encounter,
    "value": avg(values)
  }
  pipeMessage(client,message);
}

//Generate and Send a Min Message
function genAndSendMinMessage (values){
  var message = {
    "concept": msg.concept,
    "person": msg.patient,
    "obsDatetime": msg.obsDatetime,
    "encounter": msg.encounter,
    "value": min(values)
  }
  pipeMessage(client,message);
}

//Generate and Send an Average Message
function genAndSendMaxMessage (values){
  var message = {
    "concept": msg.concept,
    "person": msg.patient,
    "obsDatetime": msg.obsDatetime,
    "encounter": msg.encounter,
    "value": max(values)
  }
  pipeMessage(client,message);
}

//This function set if there is an alarm or not
function setAlarm (msg, client){
  if(msg.concept == "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Temperature
    if(msg.value > 37.3 || msg.value < 35.6){
      pipeMessage(client, msg);
    }
  } else if(msg.concept == "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Systolic BP
    if(msg.value > 120 || msg.value < 90){
      pipeMessage(client, msg);
    }
  } else if(msg.concept == "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Diastolic BP
    if(msg.value > 80 || msg.value < 60){
      pipeMessage(client, msg);
    }
  } else if(msg.concept == "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //SpO2
    if(msg.value > 100 || msg.value < 95){
      pipeMessage(client, msg);
    }
  } else if(msg.concept == "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Pulse
    if(msg.value > 100 || msg.value < 60){
      pipeMessage(client, msg);
    }
  } else if(msg.concept == "5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"){
    //Respiratory Frequency
    if(msg.value > 18 || msg.value < 12){
      pipeMessage(client, msg);
    }
  }
}

// This function just pipes the messages without any change.
function pipeMessage(client, msg) {
  client.sendOutputEvent('output1', msg, printResultFor('Sending received message'));
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}
