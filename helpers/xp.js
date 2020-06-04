module.exports.type = 'extension';

module.exports.ext = (client, message) => {
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