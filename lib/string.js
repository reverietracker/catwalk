function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function smushName(prefix, name) {
    return prefix + capitalize(name);
}

function camelCaseToLabel(name) {
    return capitalize(name.replace(/([A-Z])/g, ' $1').trim().toLowerCase());
}

module.exports = { capitalize, smushName, camelCaseToLabel };
