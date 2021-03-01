import calculateMonths from '../utilities/calculate-months.js';
import formatTax from '../utilities/format-tax.js';
import handleSelectMonthsFrom from '../utilities/handle-select-months-from.js';






const elementDrawbar = document.querySelector('.jsCalcCaravanDrawbar');
const elementDrawbarInput = document.querySelector('.jsCalcCaravanDrawbarInput');
const elementMonths = document.querySelector('.jsCalcCaravanMonths');
const elementMonthsSelectFrom = document.querySelector('.jsCalcCaravanMonthsSelectFrom');
const elementMonthsSelectTo = document.querySelector('.jsCalcCaravanMonthsSelectTo');
const elementResult = document.querySelector('.jsCalcCaravanResult');
const elementResultValue = document.querySelector('.jsCalcCaravanResultValue');
const elementSeasonalBtn = document.querySelector('.jsCalcCaravanSeasonalBtn');
const elementSemitrailerSelect = document.querySelector('.jsCalcCaravanSemitrailerSelect');
const elementStandardBtn = document.querySelector('.jsCalcCaravanStandardBtn');
const elementTotalInput = document.querySelector('.jsCalcCaravanTotalInput');






function calculateTax(state) {
    let result = 0;

    const drawbar = parseInt(state.drawbar, 10) || 0;
    const months = parseInt(state.months, 10) || 0;
    const semitrailer = parseInt(state.semitrailer, 10) || 0;
    const total = parseInt(state.total, 10) || 0;

    result = semitrailer * drawbar;
    result = total - result;
    result = Math.ceil(result / 200);
    result = Math.floor(result * 7.46 / 12 * months);
    result = Math.min(result, 373.24);
    result = Math.floor(result);

    return result;
}

function printResult(state) {
    const price = parseInt(state.price, 10);

    elementResultValue.textContent = `${formatTax(price)} €`;
}






if (
    elementDrawbar &&
    elementDrawbarInput &&
    elementMonths &&
    elementMonthsSelectFrom &&
    elementMonthsSelectTo &&
    elementResult &&
    elementResultValue &&
    elementSeasonalBtn &&
    elementSemitrailerSelect &&
    elementStandardBtn &&
    elementTotalInput
) {
    let state = {
        drawbar: 0,
        months: 12,
        period: 'standard',
        price: 0,
        semitrailer: 0,
        total: 0,
    };



    elementTotalInput.addEventListener('input', (event) => {
        state.total = elementTotalInput.value;
        state.price = calculateTax(state);
        printResult(state);
    }, false);



    elementDrawbarInput.addEventListener('input', (event) => {
        state.drawbar = elementDrawbarInput.value;
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



    elementSemitrailerSelect.addEventListener('change', (event) => {
        state.semitrailer = elementSemitrailerSelect.options[elementSemitrailerSelect.selectedIndex].value;
        state.price = calculateTax(state);

        if (parseInt(state.semitrailer, 10) === 1) {
            elementDrawbar.hidden = false;
        } else {
            elementDrawbar.hidden = true;
        }

        printResult(state);
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
