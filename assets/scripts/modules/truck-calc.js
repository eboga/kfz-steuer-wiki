import calculateMonths from '../utilities/calculate-months.js';
import formatTax from '../utilities/format-tax.js';
import handleSelectMonthsFrom from '../utilities/handle-select-months-from.js';






const elementEmissionSelect = document.querySelector('.jsCalcTruckEmissionSelect');
const elementMonths = document.querySelector('.jsCalcTruckMonths');
const elementMonthsSelectFrom = document.querySelector('.jsCalcTruckMonthsSelectFrom');
const elementMonthsSelectTo = document.querySelector('.jsCalcTruckMonthsSelectTo');
const elementResult = document.querySelector('.jsCalcTruckResult');
const elementResultValue = document.querySelector('.jsCalcTruckResultValue');
const elementSeasonalBtn = document.querySelector('.jsCalcTruckSeasonalBtn');
const elementStandardBtn = document.querySelector('.jsCalcTruckStandardBtn');
const elementTotalInput = document.querySelector('.jsCalcTruckTotalInput');






function calculateTax(state) {
    let result = 0;

    const emission = state.emission;
    const months = parseInt(state.months, 10);
    const total = parseInt(state.total, 10);

    const emissions = {
        a1: {
            maximum: 556,
            plans: [
                { min: 0, max: 2000, multiplier: 6.42 },
                { min: 2000, max: 3000, multiplier: 6.88 },
                { min: 3000, max: 4000, multiplier: 7.31 },
                { min: 4000, max: 5000, multiplier: 7.75 },
                { min: 5000, max: 6000, multiplier: 8.18 },
                { min: 6000, max: 7000, multiplier: 8.62 },
                { min: 7000, max: 8000, multiplier: 9.36 },
                { min: 8000, max: 9000, multiplier: 10.07 },
                { min: 9000, max: 10000, multiplier: 10.97 },
                { min: 10000, max: 11000, multiplier: 11.84 },
                { min: 11000, max: 12000, multiplier: 13.01 },
                { min: 12000, max: 99999000, multiplier: 14.32 },
            ],
        },
        a2: {
            maximum: 914,
            plans: [
                { min: 0, max: 2000, multiplier: 6.42 },
                { min: 2000, max: 3000, multiplier: 6.88 },
                { min: 3000, max: 4000, multiplier: 7.31 },
                { min: 4000, max: 5000, multiplier: 7.75 },
                { min: 5000, max: 6000, multiplier: 8.18 },
                { min: 6000, max: 7000, multiplier: 8.62 },
                { min: 7000, max: 8000, multiplier: 9.36 },
                { min: 8000, max: 9000, multiplier: 10.07 },
                { min: 9000, max: 10000, multiplier: 10.97 },
                { min: 10000, max: 11000, multiplier: 11.84 },
                { min: 11000, max: 12000, multiplier: 13.01 },
                { min: 12000, max: 13000, multiplier: 14.32 },
                { min: 13000, max: 14000, multiplier: 15.77 },
                { min: 14000, max: 15000, multiplier: 26.0 },
                { min: 15000, max: 99999000, multiplier: 36.23 },
            ],
        },
        a3: {
            maximum: 1425,
            plans: [
                { min: 0, max: 2000, multiplier: 9.64 },
                { min: 2000, max: 3000, multiplier: 10.3 },
                { min: 3000, max: 4000, multiplier: 10.97 },
                { min: 4000, max: 5000, multiplier: 11.61 },
                { min: 5000, max: 6000, multiplier: 12.27 },
                { min: 6000, max: 7000, multiplier: 12.94 },
                { min: 7000, max: 8000, multiplier: 14.03 },
                { min: 8000, max: 9000, multiplier: 15.11 },
                { min: 9000, max: 10000, multiplier: 16.44 },
                { min: 10000, max: 11000, multiplier: 17.74 },
                { min: 11000, max: 12000, multiplier: 19.51 },
                { min: 12000, max: 13000, multiplier: 21.47 },
                { min: 13000, max: 14000, multiplier: 23.67 },
                { min: 14000, max: 15000, multiplier: 39.01 },
                { min: 15000, max: 99999000, multiplier: 54.35 },
            ],
        },
        a4: {
            maximum: 1681,
            plans: [
                { min: 0, max: 2000, multiplier: 11.25 },
                { min: 2000, max: 3000, multiplier: 12.02 },
                { min: 3000, max: 4000, multiplier: 12.78 },
                { min: 4000, max: 5000, multiplier: 13.55 },
                { min: 5000, max: 6000, multiplier: 14.32 },
                { min: 6000, max: 7000, multiplier: 15.08 },
                { min: 7000, max: 8000, multiplier: 16.36 },
                { min: 8000, max: 9000, multiplier: 17.64 },
                { min: 9000, max: 10000, multiplier: 19.17 },
                { min: 10000, max: 11000, multiplier: 20.71 },
                { min: 11000, max: 12000, multiplier: 22.75 },
                { min: 12000, max: 13000, multiplier: 25.05 },
                { min: 13000, max: 14000, multiplier: 27.61 },
                { min: 14000, max: 15000, multiplier: 45.5 },
                { min: 15000, max: 99999000, multiplier: 63.4 },
            ],
        },
    };

    if (!emissions[emission]) {
        return 0;
    }

    const plans = emissions[emission].plans;
    const maximum = emissions[emission].maximum;

    for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];

        if (plan.max < total) {
            result += Math.ceil((plan.max - plan.min) / 200) * plan.multiplier;
        } else if (plan.min < total && total <= plan.max) {
            result += Math.ceil((total - plan.min) / 200) * plan.multiplier;
        }
    }

    result = result / 12 * months;

    result = Math.min(result, maximum);

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
