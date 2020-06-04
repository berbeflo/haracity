const mysql = require('mysql');

module.exports.type = 'extension';

module.exports.create = (config) => {
    const con = mysql.createConnection(config.db);

    con.connect(err => {
        if (err) throw err;
        console.log("Connected!");
    });

    return con;
}