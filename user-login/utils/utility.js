function unixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

module.exports.currentTimestamp = unixTimestamp();

