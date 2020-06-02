exports.run = (client, message, args) => {
    var run = {
        add : addNote,
        list : listNotes,
        remove : removeNote
    };

    var args = client.helpers.filterArgs(message, [
        {
            type : 'enum',
            misc: {
                values : ['add', 'remove', 'list']
            },
            required : true,
            name : 'subcommand'
        },
        {
            type : 'userid',
            required : true,
            name : 'pinged',
            misc : {
                allowUnknown : true
            }
        },
        {
            type : 'number',
            required : false,
            name : 'id'
        },
        {
            type : 'text',
            required : false,
            name : 'note',
            max : -1
        }
    ], args, {
        forceOrder : true,
        validators : [
            (argsList, message) => {
                switch (argsList.subcommand[0]) {
                    case 'list':
                        return true;
                    case 'add':
                        return argsList.note.length > 0;
                    case 'remove':
                        return argsList.id.length === 1;
                    default:
                        return false;
                }
            }
        ]
    });

    console.log(args);

    if (!args.isValid) {
        return message.channel.send('just nope!');
    }

    run[args.subcommand[0]](client, message, args);
};

addNote = (client, message, args) => {
    var sql = 'insert into note set ?';
    var data = {
        guild : message.guild.id,
        author : message.author.id,
        user : args.pinged[0],
        message : args.note.join(' ')
    };
    client.db.query(sql, data, (error, result) => {
        message.channel.send('added note');
    });
};

listNotes = (client, message, args) => {
    var data = [
        message.guild.id,
        args.pinged[0]
    ];
    var sql = 'select * from note where guild = ? and user = ? order by id asc';
    
    client.db.query(sql, data, (error, result) => {
        if (result.length === 0) {
            message.channel.send('no notes found for this user');
        }
        result.forEach(element => {
            message.channel.send(`${element.id} | <@${element.author}> | ${element.message}`);
        });
    });
};

removeNote = (client, message, args) => {
    var data = [
        message.guild.id,
        args.pinged[0],
        args.id[0]
    ];
    var sql = 'delete from note where guild = ? and user = ? and id = ?';

    client.db.query(sql, data, (error, result) => {
        if (result.affectedRows > 0) {
            return message.channel.send(`removed the note with id ${args.id[0]}`);
        }
        message.channel.send('ooops, something went wrong');
    });
};