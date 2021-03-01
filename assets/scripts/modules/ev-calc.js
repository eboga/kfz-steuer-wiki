import calculateMonths from '../utilities/calculate-months.js';
import formatTax from '../utilities/format-tax.js';
import handleSelectMonthsFrom from '../utilities/handle-select-months-from.js';






const elementMonths = document.querySelector('.jsCalcEvMonths');
const elementMonthsSelectFrom = document.querySelector('.jsCalcEvMonthsSelectFrom');
const elementMonthsSelectTo = document.querySelector('.jsCalcEvMonthsSelectTo');
const elementResult = document.querySelector('.jsCalcEvResult');
const elementResultValue = document.querySelector('.jsCalcEvResultValue');
const elementSeasonalBtn = document.querySelector('.jsCalcEvSeasonalBtn');
const elementStandardBtn = document.querySelector('.jsCalcEvStandardBtn');
const elementTotalInput = document.querySelector('.jsCalcEvTotalInput');






function calculateTax(state) {
    let result = 0;

    const total = parseInt(state.total, 10);
    const months = parseInt(state.months, 10);

    const plans = [
        { min: 0, max: 2000, multiplier: 11.25 },
        { min: 2000, max: 3000, multiplier: 12.02 },
        { min: 3000, max: 3500, multiplier: 12.78 },
    ]

    for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];

        if (plan.max < total) {
            result += Math.ceil((plan.max - plan.min) / 200) * plan.multiplier;
        } else if (plan.min < total && total <= plan.max) {
            result += Math.ceil((total - plan.min) / 200) * plan.multiplier;
        }
    }

    result = result * 0.5 / 12 * months;

    return result;
}

function printResult(state) {
    const price = parseInt(state.price, 10) || 0;

    elementResultValue.textContent = `${formatTax(price)} €`;
}






if (
    elementMonths &&
    elementMonthsSelectFrom &&
    elementMonthsSelectTo &&
    elementResult &&
    elementResultValue &&
    elementSeasonalBtn &&
    elementStandardBtn &&
    elementTotalInput
) {
    let state = {
        months: 12,
        period: 'standard',
        price: 0,
        total: 0,
    };



    elementTotalInput.addEventListener('input', (event) => {
        state.total = elementTotalInput.value || 0;
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
