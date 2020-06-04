exports.run = (client, message, args) => {
    args = client.ext.filterArgs(message, [
        {
            type : 'number',
            required : true,
            name : 'amount'
        },
        {
            type : 'userid',
            required : true,
            name : 'receiver'
        }
    ], args, {
        allowUnmatched: true,
        validators: [
            (argsList, message) => {
                return argsList.receiver[0] !== message.member.user.id;
            }
        ]
    });

    if (!args.isValid) {
        message.channel.send('Usage : hc.give <amount> <receiver>; the receiver must be different from the giver');
        return;
    }

    message.channel.send(`Successfully gave ${message.guild.member(args.receiver[0]).user.username} ${args.amount[0]} Cookies`);
};

exports.type = 'command';