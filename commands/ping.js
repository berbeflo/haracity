exports.run = (client, message, args) => {
    message.channel.send('pong!');
    client.helpers.filterArgs(message, [
        {
            type : 'userid',
            required : true,
            name : 'pinged'
        }
    ], args);
};