import calculateMonths from '../utilities/calculate-months.js';
import formatTax from '../utilities/format-tax.js';
import handleSelectMonthsFrom from '../utilities/handle-select-months-from.js';






const elementSeasonalBtn = document.querySelector('.jsCalcOldtimerSeasonalBtn');
const elementStandardBtn = document.querySelector('.jsCalcOldtimerStandardBtn');
const elementResult = document.querySelector('.jsCalcOldtimerResult');
const elementResultValue = document.querySelector('.jsCalcOldtimerResultValue');
const elementMonths = document.querySelector('.jsCalcOldtimerSelectMonths');
const elementMonthsSelectFrom = document.querySelector('.jsCalcOldtimerSelectMonthsFrom');
const elementMonthsSelectTo = document.querySelector('.jsCalcOldtimerSelectMonthsTo');
const elementSelectType = document.querySelector('.jsCalcOldtimerSelectType');






function calculateTax(state) {
    let result = 0;

    const type = parseInt(state.type, 10);
    const months = parseInt(state.months, 10);

    if (type === 1) {
        result = Math.floor(191.73);
    } else if (type === 2) {
        result = Math.floor(46.02);
    } else {
        return 0;
    }

    result = Math.floor(result / 12 * months);

    return result;
}

function printResult(state) {
    const type = parseInt(state.type, 10);
    const price = parseInt(state.price, 10);

    if (type === 1 || type === 2) {
        elementResultValue.textContent = `${formatTax(price)} €`;
    } else {
        elementResultValue.textContent = `${Number(0).toFixed(2)} €`;
    }
}






if (
    elementSeasonalBtn &&
    elementStandardBtn &&
    elementMonths &&
    elementResult &&
    elementResultValue &&
    elementMonthsSelectFrom &&
    elementMonthsSelectTo &&
    elementSelectType
) {
    let state = {
        months: 12,
        period: 'standard',
        price: 0,
        type: 0,
    };



    elementSelectType.addEventListener('change', (event) => {
        state.type = elementSelectType.options[elementSelectType.selectedIndex].value;
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
