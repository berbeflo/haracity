module.exports.type = 'extension';

module.exports.ext = (message, config, args, options) => {
    mapping = {
        number : validateNumber,
        userid : validateUserId,
        channelid : validateChannelId,
        text : validateText,
        enum : validateEnum
    };

    if (typeof options === 'undefined') {
        options = {};
    }
    options = normalizeOptions(options);
    [argsList, config] = normalizeConfig(config);

    for (var argCounter = 0; argCounter < args.length; argCounter++) {
        var isMatched = false;
        for (var configCounter = 0; configCounter < config.length; configCounter++) {
            if (config[configCounter].counter === config[configCounter].max && config[configCounter].max !== -1) {
                continue;
            }
            [valid, value] = mapping[config[configCounter].type](
                args[argCounter], 
                message,
                config[configCounter]
            );

            if (!valid) {
                if (options.forceOrder) {
                    config[configCounter].counter++;
                    if (config[configCounter].required) {
                        argsList.isValid = false;
                    }
                }
                continue;
            }

            config[configCounter].counter++;
            argsList[config[configCounter].name].push(value);
            isMatched = true;
            break;
        }

        if (!isMatched && !options.allowUnmatched) {
            argsList.isValid = false;
        }
    }

    if (!argsList.isValid) {
        return argsList;
    }

    for (var configCounter = 0; configCounter < config.length; configCounter++) {
        if (config[configCounter].required === false) {
            continue;
        }

        if (argsList[config[configCounter].name].length < config[configCounter].min) {
            argsList.isValid = false;
        }
    }

    if (!argsList.isValid) {
        return argsList;
    }

    options.validators.forEach(fun => {
        isValid = fun(argsList, message);
        if (!isValid) {
            argsList.isValid = false;
        }
    });

    return argsList;
};

validateNumber = (value, message, config) => {
    var match = value.match(/^\d{1,14}$/);
    if (match === null) {
        return [false, null];
    }

    return [true, match[0]];
}

validateText = (value, message, config) => {
    return [true, value];
}

validateUserId = (value, message, config) => {
    var match = value.match(/^(<@!)?(\d{17,18})(>)?$/);
    if (match === null) {
        return [false, null];
    }

    var userId = match[2];

    if (typeof config.misc.allowUnknown !== 'undefined' && config.misc.allowUnknown) {
        return [true, userId];
    } 

    member = message.guild.member(userId);
    if (member === null) {
        return [false, null];
    }
    
    return [true, userId];
}

validateChannelId = (value, message, config) => {
    var match = value.match(/^(<#)?(\d{17,18})(>)?$/);
    if (match === null) {
        return [false, null];
    }

    var channelId = match[2];

    return [true, channelId];
}

validateEnum = (value, message, config) => {
    for (var i = 0; i < config.misc.values.length; i++) {
        if (value === config.misc.values[i]) {
            return [true, value];
        }
    }

    return [false, null];
}

normalizeConfig = (config) => {
    newConfig = [];
    argsList = {
        isValid : true
    };
    config.forEach(element => {
        newConfigEntry = {};
        newConfigEntry.required = (typeof element.required !== 'undefined' && element.required);
        newConfigEntry.type = element.type;
        newConfigEntry.min = (typeof element.min !== 'undefined') ? element.min : (newConfigEntry.required ? 1 : 0);
        newConfigEntry.max = (typeof element.max !== 'undefined') ? element.max : 1;
        newConfigEntry.name = element.name;
        newConfigEntry.counter = 0;
        newConfigEntry.misc = (typeof element.misc !== 'undefined') ? element.misc : {};
        newConfig.push(newConfigEntry);

        argsList[newConfigEntry.name] = [];
    });

    return [argsList, newConfig];
};

normalizeOptions = (options) => {
    newOptions = {};
    newOptions.allowUnmatched = (typeof options.allowUnmatched === 'undefined') ? true : options.allowUnmatched;
    newOptions.forceOrder = (typeof options.forceOrder === 'undefined') ? false : options.forceOrder;
    newOptions.validators = (typeof options.validators === 'undefined') ? [] : options.validators;

    return newOptions;
};