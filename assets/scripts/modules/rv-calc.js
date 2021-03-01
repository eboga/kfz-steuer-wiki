import calculateMonths from '../utilities/calculate-months.js';
import formatTax from '../utilities/format-tax.js';
import handleSelectMonthsFrom from '../utilities/handle-select-months-from.js';






const elementEmissionSelect = document.querySelector('.jsCalcRvEmissionSelect');
const elementMonths = document.querySelector('.jsCalcRvMonths');
const elementMonthsSelectFrom = document.querySelector('.jsCalcRvMonthsSelectFrom');
const elementMonthsSelectTo = document.querySelector('.jsCalcRvMonthsSelectTo');
const elementResult = document.querySelector('.jsCalcRvResult');
const elementResultValue = document.querySelector('.jsCalcRvResultValue');
const elementSeasonalBtn = document.querySelector('.jsCalcRvSeasonalBtn');
const elementStandardBtn = document.querySelector('.jsCalcRvStandardBtn');
const elementTotalInput = document.querySelector('.jsCalcRvTotalInput');






function calculateTax(state) {
    let result = 0;

    const emission = state.emission;
    const total = parseInt(state.total, 10);
    const months = parseInt(state.months, 10);

    let maximum = 0;
    let tax1 = 0;
    let tax2 = 0;
    let tax3 = 0;
    let tax4 = 0;

    if (emission === 'a1') {
        maximum = 800;
        tax1 = Math.ceil(total / 200) * 16;

        if (total > 2000) {
            tax1 = 10 * 16;
            tax2 = Math.ceil((total - 2000) / 200) * 10;
        }
    } else if (emission === 'a2') {
        maximum = 1000;
        tax1 = Math.ceil(total / 200) * 24;

        if (total > 2000) {
            tax1 = 10 * 24;
            tax2 = Math.ceil((total - 2000) / 200) * 10;
        }
    } else if (emission === 'a3') {
        maximum = 10000000000;
        tax1 = Math.ceil(total / 200) * 40;

        if (total > 2000 && total <= 5000) {
            tax1 = 10 * 40;
            tax2 = Math.ceil((total - 2000) / 200) * 10;
        }

        if (total > 5000 && total <= 12000) {
            tax1 = 10 * 40
            tax2 = 15 * 10
            tax3 = Math.ceil((total - 5000) / 200) * 15;
        }

        if (total > 12000) {
            tax1 = 10 * 40;
            tax2 = 15 * 10;
            tax3 = 35 * 15;
            tax4 = Math.ceil((total - 12000) / 200) * 25;
        }
    }

    result = tax1 + tax2 + tax3 + tax4;
    result = Math.min(result, maximum);
    result = result / 12 * months;

    return result;
}

function printResult(state) {
    const price = parseInt(state.price, 10) || 0;

    elementResultValue.textContent = `${formatTax(price)} €`;
}






if (
    elementEmissionSelect &&
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
        emission: '',
        months: 12,
        period: 'standard',
        price: 0,
        total: 0,
    };



    elementEmissionSelect.addEventListener('input', (event) => {
        state.emission = elementEmissionSelect.options[elementEmissionSelect.selectedIndex].value;
        state.price = calculateTax(state);

        printResult(state);
    }, false);



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
