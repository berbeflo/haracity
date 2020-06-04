const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./.config.json');
const Enmap = require('enmap');
const fs = require('fs');

client.config = config;
client.ext = {};
client.commands = {};

const blacklist = {
    '.git' : null,
    '.gitignore' : null,
    '.config.json' : null,
    'node_modules' : null,
    'package-lock.json' : null,
    'package.json' : null,
    'index.js' : null
};

walk = (basepath) => {
    basepath = basepath + '/';
    fs.readdir(basepath, (err, files) => {
        files.forEach(file => {
            if (typeof blacklist[file] !== 'undefined') {
                return;
            }
            fs.stat(basepath + file, (err, stats) => {
                if (stats.isDirectory()) {
                    return walk(basepath + file);
                }

                let defaultName = file.split('.')[0];
                let props = require(basepath + file);

                switch (props.type) {
                    case 'event':
                        return registerEvent(client, props, defaultName);
                    case 'extension':
                        return registerExtension(client.ext, props, defaultName);
                    case 'command':
                        return registerCommand(client.commands, props, defaultName);
                    default:
                        console.log(`no action defined for ${basepath + file}`);
                }
            });
        });
    });
}
walk('.');

client.login(client.config.token);

registerEvent = (client, props, name) => {
    client.on(name, props.run.bind(null, client));
}

registerCommand = (commands, props, name) => {  
    var names = typeof props.aliases !== 'undefined' ? props.aliases : [name];

    names.forEach(name => {
        commands[name] = props.run;
    });
}

registerExtension = (extensions, props, name) => {
    let fun = (typeof props.create === 'undefined') ? props.ext : props.create(client.config);
    extensions[name] = fun;
}