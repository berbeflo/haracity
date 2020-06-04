module.exports.run = (client, message) => {
    if (message.author.bot) {
        return;
    }
    
    client.ext.xp(client, message);

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