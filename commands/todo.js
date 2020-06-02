exports.run = (client, message, args) => {
    var run = {
        create : createTodoList,
        add : addTodoEntry,
        show : showTodoList,
        check : checkTodoEntry
    };
    var args = client.helpers.filterArgs(message, [
        {
            type : 'enum',
            required : true,
            name : 'subcommand',
            misc: {
                values : ['add', 'check', 'create', 'delete', 'show']
            }
        },
        {
            type : 'number',
            required : false,
            name : 'listid'
        },
        {
            type : 'number',
            required : false,
            name : 'entryid'
        },
        {
            type : 'userid',
            required : false,
            name : 'responsible',
            misc : {
                allowUnknown : true
            }
        },
        {
            type : 'text',
            required : false,
            name : 'text',
            max : -1
        }
    ], args, {
        allowUnmatched : true,
        validators : [
            (argsList, message) => {
                switch (argsList.subcommand[0]) {
                    case 'add':
                        return (
                            argsList.listid.length === 1 && 
                            argsList.entryid.length === 0 &&
                            argsList.responsible.length === 1 && 
                            argsList.text.length > 0
                        );
                    case 'check':
                        return (
                            argsList.listid.length === 1 &&
                            argsList.entryid.length === 1 &&
                            argsList.responsible.length === 0 &&
                            argsList.text.length > 0
                        );
                    case 'create':
                        return (
                            argsList.listid.length === 0 &&
                            argsList.entryid.length === 0 &&
                            argsList.responsible.length === 0 &&
                            argsList.text.length > 0
                        );
                    case 'show':
                        return (
                            argsList.listid.length === 1 &&
                            argsList.entryid.length === 0 &&
                            argsList.responsible.length === 0 &&
                            argsList.text.length === 0
                        );
                    case 'delete':
                        return (
                            argsList.listid.length === 1 &&
                            argsList.entryid.length === 0 &&
                            argsList.responsible.length === 0 &&
                            argsList.text.length === 0
                        );
                }
            }
        ]
    });

    if (!args.isValid) {
        return message.channel.send('just nope!');
    }

    run[args.subcommand[0]](client, message, args);
};

createTodoList = (client, message, args) => {
    var sql = 'insert into todolist set ?';
    var data = {
        guild : message.guild.id,
        creator : message.author.id,
        text : args.text.join(" ")
    };

    client.db.query(sql, data, (error, result) => {
        message.channel.send(`created todo list with id ${result.insertId}`);
    });
}

addTodoEntry = (client, message, args) => {
    var selectSql = 'select * from todolist where guild = ? and id = ?';
    var selectData = [
        message.guild.id,
        args.listid[0]
    ];

    client.db.query(selectSql, selectData, (error, result) => {
        if (result.length === 0) {
            return message.channel.send('no list found for this id');
        }

        if (result[0].creator !== message.author.id) {
            return message.channel.send('only the creator can do this!');
        }

        console.log(result);

        var sql = 'insert into todoentry set ?';
        var data = {
            listid : args.listid[0],
            creator : message.author.id,
            responsible : args.responsible[0],
            text : args.text.join(" ")
        };

        client.db.query(sql, data, (error, result) => {
            message.channel.send(`created todo list entry with id ${result.insertId} for list ${args.listid[0]}`);
        });
    });
}

showTodoList = (client, message, args) => {
    var selectSql = 'select * from todolist where guild = ? and id = ?';
    var selectData = [
        message.guild.id,
        args.listid[0]
    ];

    client.db.query(selectSql, selectData, (error, result) => {
        if (result.length === 0) {
            return message.channel.send('no list found for this id');
        }

        var selectSql = 'select * from todoentry where listid = ?';
        var selectData = [
            args.listid[0]
        ];

        client.db.query(selectSql, selectData, (error, result) => {
            message.channel.send(`showing data for list ${args.listid[0]}`)
            if (result.length === 0) {
                return message.channel.send('no entries found for this list');
            }

            result.forEach(element => {
                var text = `${element.id} | <@${element.responsible}> | ${element.text} | ${element.message}`;
                if (element.status === 1) {
                    text = '~~' + text + '~~';
                }
                return message.channel.send(text);
            });
        });
    });
};

checkTodoEntry = (client, message, args) => {
    var selectSql = 'select * from todolist where guild = ? and id = ?';
    var selectData = [
        message.guild.id,
        args.listid[0]
    ];

    client.db.query(selectSql, selectData, (error, result) => {
        if (result.length === 0) {
            return message.channel.send('no list found for this id');
        }

        var selectSql = 'select * from todoentry where listid = ? and id = ?';
        var selectData = [
            args.listid[0],
            args.entryid[0]
        ];

        client.db.query(selectSql, selectData, (error, result) => {
            if (result.length === 0) {
                return message.channel.send('no entry with given id found');
            }

            if (result[0].creator !== message.author.id && result[0].responsible !== message.author.id) {
                return message.channel.send('you must not change this entry');
            }

            var updateSql = 'update todoentry set status = 1, message = ? where id = ?';
            var updateData = [
                args.text.join(" "),
                args.entryid[0]
            ];

            client.db.query(updateSql, updateData, (error, result) => {
                message.channel.send('updated the entry');
            });
        });
    });
}