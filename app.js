require('dotenv-extended').load();
var restify = require('restify');
var builder = require('botbuilder');
var ssml = require('./ssml');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


// Listen for messages from users 
server.post('/api/messages', connector.listen());

/**
 * Create your bot with a function to receive messages from the user.
 * - This function will be called anytime the users utterance isn't
 *   recognized.
 */

var bot = new builder.UniversalBot(connector, function (session) {

    // Just redirect to our 'HelpDialog'.
    //   session.replaceDialog('HelpDialog');

    var card = new builder.HeroCard(session)
        .title('Hey there! How can I help you today?')
        .images('https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Celcom_logo.svg/1200px-Celcom_logo.svg.png');
       // .buttons([
    //        builder.CardAction.imBack(session, 'roll some dice', 'Roll Dice')
       // ])
  
    var msg = new builder.Message(session)
        .speak(speak(session, 'Hey there! How can I help you today?'))
        .addAttachment(card)
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg);
});
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('nearest', function (session, args) {
    // Build up spoken response
 //   var spoken = 'Which is the nearest center';
   // msg.speak(ssml.speak('which is nearest center'));
    var msg = new builder.Message(session)
        .speak(speak(session, 'The nearest center for you will be Bangsar'))
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg).endDialog();
}).triggerAction({ matches: 'nearest' });// /(roll|role|throw|shoot) again/i });

bot.dialog('HelpDialog', function (session) {
    var card = new builder.HeroCard(session)
        .title('Welcome')
        .buttons([
            builder.CardAction.imBack(session, 'roll some dice', 'Roll Dice')
        ]);
    var msg = new builder.Message(session)
        .speak(speak(session, 'Hey there! How can I help you today?'))
        //        .addAttachment(card)
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg);//.endDialog();
});//.triggerAction({ matches: /help/i });

/** Helper function to wrap SSML stored in the prompts file with <speak/> tag. */
function speak(session, prompt) {
    var localized = session.gettext(prompt);
    return ssml.speak(localized);
}
