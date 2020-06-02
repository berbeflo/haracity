module.exports = (client, message) => {
    if (message.author.bot) {
        return;
    }
    gainXP(client, message);
    if (message.content.indexOf(client.config.prefix) !== 0) {
        return;
    }

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command);
    
    if (!cmd) {
        return;
    }

    var sql = "INSERT INTO log SET ?";
    var data = {
        guild : message.guild.id,
        command : command,
        message : message.content,
        user : message.author.id
    };

    client.db.query(sql, data, (error, result) => {
        if (error) {
            console.log(error);
        }
    });

    cmd.run(client, message, args);
};

gainXP = (client, message) => {
    var selectSql = 'select * from experience where guild = ? and channel = ?';
    var selectData = [message.guild.id, message.channel.id];
    console.log(selectData);

    client.db.query(selectSql, selectData, (error, result) => {
        console.log(error);
        console.log(result);
        if (result.length > 0) {
            var insertSql = 'insert into experiencecounter set ?';
            var insertData = {
                guild : message.guild.id,
                channel : message.channel.id,
                user : message.author.id,
                xp : result[0].xp
            };

            client.db.query(insertSql, insertData, (error, result) => {
                console.log(error);
                console.log(result);
            });
        }
    });
}