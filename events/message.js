module.exports = (client, message) => {
    if (message.author.bot) {
        return;
    }

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