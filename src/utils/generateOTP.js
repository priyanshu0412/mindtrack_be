module.exports = generateOTP = (digits) => {
    const max = Math.pow(10, digits) - 1;
    const min = Math.pow(10, digits - 1);
    return Math.floor(min + Math.random() * (max - min + 1));
};