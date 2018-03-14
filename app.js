/*-----------------------------------------------------------------------------
Roller is a dice rolling skill that's been optimized for speech. 
-----------------------------------------------------------------------------*/

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
    session.replaceDialog('HelpDialog');
});
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

/**
 * This dialog sets up a custom game for the bot to play.  It will 
 * ask the user how many sides they want the dice to have and then
 * how many should be rolled. Once it's built up the game structure
 * it will pass it to a seperate 'PlayGameDialog'.
 */

bot.dialog('nearest', function (session, args) {
    // Get current or new game structure.

        var card = new builder.HeroCard(session)
            .subtitle('hi')
            .buttons([
                builder.CardAction.imBack(session, 'roll again', 'Roll Again')
            ]);
        var msg = new builder.Message(session).addAttachment(card);
        // Build up spoken response
        var spoken = 'Nearest center is Bangsar';
        msg.speak(ssml.speak(spoken));

        /**
         * Send card and bots reaction to user. 
         */
        msg.inputHint(builder.InputHint.acceptingInput);
        session.send(msg).endDialog();
    
}).triggerAction({ matches: 'nearest' });// /(roll|role|throw|shoot) again/i });

/**
 * Listen for the user to ask to play craps.
 * 
 * While you can use a triggerAction() to start a dialog, you sometimes just want
 * to either send a message when a user says something or start an existing dialog
 * with some arguments. You can use a cusomAction() to recognize something the user
 * says without tampering with the dialog stack. In our case what we want to do is
 * call 'PlayGameDialog' with a pre-defined game structure. 
 */
bot.customAction({
    matches: /(play|start).*(craps)/i,
    onSelectAction: function (session, args, next) {
        // The user could be in another dialog so clear the dialog stack first
        // to make sure we end that task.
        session.clearDialogStack().beginDialog('PlayGameDialog', {
            game: { type: 'craps', sides: 6, count: 2, turn: 0 }
        });
    }
});

/**
 * Every bot should have a help dialog. Ours will use a card with some buttons
 * to educate the user with the options available to them.
 */
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
    session.send(msg).endDialog();
}).triggerAction({ matches: /help/i });

/** Helper function to wrap SSML stored in the prompts file with <speak/> tag. */
function speak(session, prompt) {
    var localized = session.gettext(prompt);
    return ssml.speak(localized);
}
