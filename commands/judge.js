exports.run = (client, message, args) => {
    args = client.helpers.filterArgs(message, [
        {
            type : 'userid',
            required : false,
            name : 'receiver'
        },
        {
            type : 'text',
            required : false,
            name : 'receiver2'
        }
    ], args, {
        allowUnmatched: false,
        validators: [
            (argsList, message) => {
                return (argsList.receiver.length + argsList.receiver2.length) === 1;
            }
        ]
    });

    if (!args.isValid) {
        message.channel.send('Usage : hc.judge <receiver>');
        return;
    }

    receiver = (args.receiver.length === 1) ? `<@${args.receiver[0]}>` : args.receiver2[0];
    message.channel.send(`So judging you ${receiver}`);
};

exports.aliases = ['judge', 'rebecca'];