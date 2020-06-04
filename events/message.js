module.exports.run = (client, message) => {
    if (message.author.bot) {
        return;
    }
    gainXP(client, message);
    if (message.content.indexOf(client.config.prefix) !== 0) {
        return;
    }

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands[command];
    
    if (typeof cmd === 'undefined') {
        return;
    }

    var sql = "INSERT INTO log SET ?";
    var data = {
        guild : message.guild.id,
        command : command,
        message : message.content,
        user : message.author.id
    };

    client.ext.db.query(sql, data, (error, result) => {

    });

    cmd(client, message, args);
};

module.exports.type = 'event';

gainXP = (client, message) => {
    var selectSql = 'select * from experience where guild = ? and channel = ?';
    var selectData = [message.guild.id, message.channel.id];

    client.ext.db.query(selectSql, selectData, (error, result) => {
        if (result.length > 0) {
            var insertSql = 'insert into experiencecounter set ?';
            var insertData = {
                guild : message.guild.id,
                channel : message.channel.id,
                user : message.author.id,
                xp : result[0].xp
            };

            client.ext.db.query(insertSql, insertData, (error, result) => {

            });
        }
    });
}