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

var bot = new builder.UniversalBot(connector, function (session) {
    session.replaceDialog('HelpDialog');
});
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('HelpDialog', function (session) {
    var card = new builder.HeroCard(session)
        .title('Hey there! How can I help you today?');
    var msg = new builder.Message(session)
        .speak(speak(session, 'Hey there! How can I help you today?'))
        .addAttachment(card)
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg).endDialog();
}).triggerAction({ matches: /help/i });

bot.dialog('nearest', function (session) {
    var msg = new builder.Message(session)
        .speak(speak(session, 'The nearest center is Bangsar'))
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg).endDialog();
}).triggerAction({ matches: 'nearest' });

function speak(session, prompt) {
    var localized = session.gettext(prompt);
    return ssml.speak(localized);
}
bot.dialog('subscription', function (session) {
    var msg = new builder.Message(session)
        .speak(speak(session, 'We will inform you via SMS when 1-Day Social Roam Pass has been successfully activated.'))
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg).endDialog();
}).triggerAction({ matches: 'subscription' });

bot.dialog('roampass', function (session) {
    var msg = new builder.Message(session)
        .speak(speak(session, '1-Day Social Roam Pass can be used across these listed operators network in 10 countries.'))
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg).endDialog();
}).triggerAction({ matches: 'roampass'});
