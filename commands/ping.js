exports.type = 'command';

exports.run = (client, message, args) => {
    message.channel.send('pong!');
    client.ext.filterArgs(message, [
        {
            type : 'userid',
            required : true,
            name : 'pinged'
        }
    ], args);
};