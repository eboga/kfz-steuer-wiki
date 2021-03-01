import calculateMonths from '../utilities/calculate-months.js';
import formatTax from '../utilities/format-tax.js';
import handleSelectMonthsFrom from '../utilities/handle-select-months-from.js';






const elementDisplacementInput = document.querySelector('.jsCalcBikeDisplacementInput');
const elementMonths = document.querySelector('.jsCalcBikeMonths');
const elementMonthsSelectFrom = document.querySelector('.jsCalcBikeSelectMonthsFrom');
const elementMonthsSelectTo = document.querySelector('.jsCalcBikeSelectMonthsTo');
const elementResultLess = document.querySelector('.jsCalcBikeResultLess');
const elementResultMore = document.querySelector('.jsCalcBikeResultMore');
const elementResultMoreValue = document.querySelector('.jsCalcBikeResultMoreValue');
const elementSeasonalBtn = document.querySelector('.jsCalcBikeSeasonalBtn');
const elementStandardBtn = document.querySelector('.jsCalcBikeStandardBtn');






function calculateTax(state) {
    let result = 0;

    const displacement = parseInt(state.displacement, 10);
    const months = parseInt(state.months, 10);

    if (displacement < 125) {
        return 0;
    }

    result = Math.ceil(displacement / 25);
    result = Math.floor(result * 1.84);
    result = Math.floor(result / 12 * months);

    return result;
}

function printResult(state) {
    const price = parseInt(state.price, 10);
    const displacement = parseInt(state.displacement, 10);

    if (displacement < 125) {
        elementResultLess.hidden = false;
        elementResultMore.hidden = true;
    } else {
        elementResultLess.hidden = true;
        elementResultMore.hidden = false;
        elementResultMoreValue.textContent = `${formatTax(price)} €`;
    }
}






if (
    elementDisplacementInput &&
    elementMonths &&
    elementMonthsSelectFrom &&
    elementMonthsSelectTo &&
    elementResultLess &&
    elementResultMore &&
    elementResultMoreValue &&
    elementSeasonalBtn &&
    elementStandardBtn
) {
    let state = {
        displacement: 0,
        months: 12,
        period: 'standard',
        price: 0,
    };



    elementDisplacementInput.addEventListener('input', (event) => {
        state.displacement = elementDisplacementInput.value || 0;
        state.price = calculateTax(state);

        printResult(state);
    }, false);



    elementStandardBtn.addEventListener('click', (event) => {
        if (!elementStandardBtn.classList.contains('button-active')) {
            elementStandardBtn.classList.add('button-active');
            elementSeasonalBtn.classList.remove('button-active');
            elementMonths.hidden = true;

            state.period = 'standard';
            state.months = 12;
            state.price = calculateTax(state);

            printResult(state);
        }
    }, false);

    elementSeasonalBtn.addEventListener('click', (event) => {
        if (!elementSeasonalBtn.classList.contains('button-active')) {
            elementSeasonalBtn.classList.add('button-active');
            elementStandardBtn.classList.remove('button-active');
            elementMonths.hidden = false;

            state.period = 'seasonal';
            state.months = calculateMonths(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }
    }, false);






    elementMonthsSelectFrom.addEventListener('change', (event) => {
        handleSelectMonthsFrom(elementMonthsSelectFrom, elementMonthsSelectTo)

        state.months = calculateMonths(elementMonthsSelectFrom, elementMonthsSelectTo);
        state.price = calculateTax(state);

        printResult(state);
    }, false);

    elementMonthsSelectTo.addEventListener('change', (event) => {
        state.months = calculateMonths(elementMonthsSelectFrom, elementMonthsSelectTo);
        state.price = calculateTax(state);

        printResult(state);
    }, false);
}
