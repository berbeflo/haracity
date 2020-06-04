const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./.config.json');
const Enmap = require('enmap');
const fs = require('fs');
const mysql = require('mysql');

const con = mysql.createConnection(config.db);

con.connect(err => {
    if (err) throw err;
    console.log("Connected!");
});

client.config = config;

client.ext = {};
client.ext.db = con;

fs.readdir('./helpers/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let props = require(`./helpers/${file}`);
        let helperName = file.split('.')[0];
        client.ext[helperName] = props;
    });
});

fs.readdir('./events/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
    });
});

client.commands = new Enmap();

fs.readdir('./commands/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let props = require(`./commands/${file}`);
        let commandName = file.split('.')[0];
        var names = typeof props.aliases !== 'undefined' ? props.aliases : [commandName];

        names.forEach(name => {
            client.commands.set(name, props);
        });
        
    });
});

client.login(client.config.token);