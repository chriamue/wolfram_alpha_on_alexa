/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict'
const co = require('co');
const Alexa = require('ask-sdk-core')

const APP_ID = process.env.APP_ID; // TODO replace with your app ID (OPTIONAL). const APP_ID = process.env.APP_ID
const WOLFRAM_APP_ID = process.env.WOLFRAM_APP_ID;

const wolfram = require('wolfram-alpha').createClient(WOLFRAM_APP_ID);

var Ask = async function (query, responseBuilder) {
  var name = 'Wolfram alpha asked question';

  console.log(query);
  let resp = await wolfram.query(query).then(function (result) {
    console.log(result)
    var speechText = ''
    
    if (Array.isArray(result)) {
      var answer = result[1].subpods[0].text
      speechText = answer
    }
    var description = query + ': ' + speechText;
    return responseBuilder
      .speak(speechText)
      .withSimpleCard('wolfram alpha', description)
      .getResponse();
  }).catch(function (e) {
    return responseBuilder
      .speak(e)
      .withSimpleCard('wolfram alpha', e)
      .getResponse();
  });
  return resp;
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to wolfram alpha skill!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const AskIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AskIntent';
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;

    var query = request.intent.slots.Query.value
    return await Ask(query, responseBuilder).then(function (resp) {
      return resp;
    }).catch(function (e) {
      return handlerInput.responseBuilder
        .speak('unknown error')
        .withSimpleCard('error in wolfram alpha', e)
        .getResponse();
    });
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask questions to wolfram alpha.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler,
    AskIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)
  .lambda();