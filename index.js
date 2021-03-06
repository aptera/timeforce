/**
 * A Bot for Slack!
 */

const appInsights = require("applicationinsights");
appInsights.setup("5c7067a7-5362-4e09-9778-2cd97a9ed60");
appInsights.start();

 require('dotenv').config()

/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({
            user: installer
        }, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({
            mongoUri: process.env.MONGOLAB_URI
        }),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN) ? './db_slack_bot_ci/' : './db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "I'm here!")
});

controller.hears('hello', 'direct_message', function (bot, message) {
    controller.storage.users.get(message.user, function (error, userData) {

        if (!userData) {
            userData = {
                id: message.user,
                messages: [message]
            }
        } else {
            userData.messages.push(message);
        }

        controller.storage.users.save(userData, function (error) {
            if (error) {
                console.log("Error " + error);
            }
        });
    });
    bot.reply(message, {
        attachments: [{
            title: 'Would you like to see my supported commands?',
            callback_id: 'seeSupportedCommandsCallback',
            attachment_type: 'default',
            actions: [{
                "name":"yes",
                "text":"Yes, please.",
                "value":"yes",
                "type":"button"
            }]
        }]
    });
});

controller.on('interactive_message_callback', function(bot, message){
    if(message.callback_id === 'seeSupportedCommandsCallback'){
            bot.replyInteractive(message,
                {text: "Here they are:\n" + strSupportedCommands}
            );
        }
});

controller.hears('log', 'direct_message', function(bot, message){
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'structure'
    }, function (err) {
        if (err) {
            console.log(err)
        }
    });
});

controller.on('message_action', function(bot, message){
    if(message.callback_id === 'newTimeEntry'){
        bot.whisper(message, "I'm sorry Dave, I'm afraid I can't do that :robot_face:");
    }
});

// LAST handler. Catchall to display supported commands.
controller.on('direct_message', function(bot, message){
    bot.reply(message, "Sorry, I didn't understand that. Here are the commands I support:\n`log [text to log]`");
});
