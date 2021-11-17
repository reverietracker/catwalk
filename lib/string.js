function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function smushName(prefix, name) {
    return prefix + capitalize(name);
}

module.exports = { capitalize, smushName };
