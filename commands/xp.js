exports.type = 'command';

exports.run = (client, message, args) => {
    var run = {
        set : setExperience,
        remove : removeExperience,
        list : showExperienceList
    };

    var args = client.ext.filterArgs(message, [
        {
            type : 'enum',
            misc: {
                values : ['set', 'remove', 'list']
            },
            required : true,
            name : 'subcommand'
        },
        {
            type : 'channelid',
            required : false,
            name : 'channel'
        },
        {
            type : 'number',
            required : false,
            name : 'xp'
        }
    ], args, {
        forceOrder : true,
        validators : [
            (argsList, message) => {
                switch (argsList.subcommand[0]) {
                    case 'set':
                        return argsList.channel.length === 1 && argsList.xp.length === 1;
                    case 'remove':
                        return argsList.channel.length === 1 && argsList.xp.length === 0;
                    case 'list':
                        return (argsList.channel.length === 0 && argsList.xp.length === 0);
                    default:
                        return false;
                }
            }
        ]
    });

    if (!args.isValid) {
        return message.channel.send('just nope!');
    }

    run[args.subcommand[0]](client, message, args);
};

removeExperience = (client, message, args) => {
    var deleteSql = 'delete from experience where guild = ? and channel = ?';
    var selectData = [message.guild.id, args.channel[0]];

    client.ext.db.query(deleteSql, selectData, (error, result) => {

    });
}

setExperience = (client, message, args) => {
    var selectSql = 'select * from experience where guild = ? and channel = ?';
    var selectData = [message.guild.id, args.channel[0]];

    client.ext.db.query(selectSql, selectData, (error, result) => {
        if (result.length === 0) {
            return addExperience(client, message, args);
        }
        updateExperience(client, message, args);
    })
}

addExperience = (client, message, args) => {
    var insertSql = 'insert into experience set ?';
    var insertData = {
        guild : message.guild.id,
        channel : args.channel[0],
        xp : args.xp[0]
    };

    client.ext.db.query(insertSql, insertData, (error, result) => {

    });
}

updateExperience = (client, message, args) => {
    var updateSql = 'update experience set xp = ? where guild = ? and channel = ?';
    var updateData = [args.xp[0], message.guild.id, args.channel[0]];

    client.ext.db.query(updateSql, updateData, (error, result) => {
        
    });
}

showExperienceList = (client, message, args) => {
    var selectSql = 'select * from experience where guild = ?';
    var selectData = [message.guild.id];

    client.ext.db.query(selectSql, selectData, (error, result) => {
        message.channel.send('Channel experience list:');
        result.forEach(entry => {
            message.channel.send(`${entry.id} | <#${entry.channel}> | ${entry.xp}`)
        });
    });
}