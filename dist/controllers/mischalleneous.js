"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandom8DigitNumber = getRandom8DigitNumber;
function getRandom8DigitNumber() {
    return Math.floor(10000000 + Math.random() * 90000000);
}
