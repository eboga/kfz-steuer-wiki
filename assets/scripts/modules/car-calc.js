import calculateMonths from '../utilities/calculate-months.js';
import formatTax from '../utilities/format-tax.js';
import handleSelectMonthsFrom from '../utilities/handle-select-months-from.js';






const elementCo2 = document.querySelector('.jsCalcCarCo2');
const elementCo2Input = document.querySelector('.jsCalcCarCo2Input');
const elementDisplacementInput = document.querySelector('.jsCalcCarDisplacementInput');
const elementEmission = document.querySelector('.jsCalcCarEmission');
const elementEmissionSelect = document.querySelector('.jsCalcCarEmissionSelect');
const elementEngineSelect = document.querySelector('.jsCalcCarEngineSelect');
const elementMonths = document.querySelector('.jsCalcCarMonths');
const elementMonthsSelectFrom = document.querySelector('.jsCalcCarMonthsSelectFrom');
const elementMonthsSelectTo = document.querySelector('.jsCalcCarMonthsSelectTo');
const elementRegistrationSelect = document.querySelector('.jsCalcCarRegistrationSelect');
const elementResult = document.querySelector('.jsCalcCarResult');
const elementResultValue = document.querySelector('.jsCalcCarResultValue');
const elementSeasonalBtn = document.querySelector('.jsCalcCarSeasonalBtn');
const elementStandardBtn = document.querySelector('.jsCalcCarStandardBtn');






function calculateTax(state) {
    let result = 0;

    const co2 = parseInt(state.co2, 10) || 0;
    const displacement = Math.ceil((parseInt(state.displacement, 10) || 0) / 100);
    const emission = state.emission;
    const engine = state.engine;
    const months = parseInt(state.months, 10) || 0;
    const price = parseInt(state.price, 10) || 0;
    const registration = state.registration;

    let co2diff = 0;
    let co2level = 0;

    if (registration === 'a1') { // EZ bis 30.06.2009
        if (emission === 'b1') { // Euro 3, D3 und besser
            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 6.75);
                result = Math.floor(result / 12 * months);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 15.44);
                result = Math.floor(result / 12 * months);
            }
        } else if (emission === 'b2') { // EURO 2
            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 7.36);
                result = Math.floor(result / 12 * months);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 16.05);
                result = Math.floor(result / 12 * months);
            }
        } else if (emission === 'b3') { // EURO 1
            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 15.13);
                result = Math.floor(result / 12 * months);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 27.35);
                result = Math.floor(result / 12 * months);
            }
        } else if (emission === 'b4') { // nicht schadstoffarm (Fahren bei Ozonalarm erlaubt)
            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 21.07);
                result = Math.floor(result / 12 * months);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 33.29);
                result = Math.floor(result / 12 * months);
            }
        } else if (emission === 'b5') { // nicht schadstoffarm (Fahren bei Ozonalarm nicht erlaubt
            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 25.36);
                result = Math.floor(result / 12 * months);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 37.58);
                result = Math.floor(result / 12 * months);
            }
        } else if (emission === 'b6') { // übrige
            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 25.36);
                result = Math.floor(result / 12 * months);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 37.58);
                result = Math.floor(result / 12 * months);
            }
        }
    } else if (registration === 'a2') { // Euro 3, D3 und besser + EZ 01.07.2009 - 31.12.2011
        co2diff = 0;
        if (co2 > 120) {
            co2diff = co2 - 120;
        }

        if (engine === 'c1') { // Benziner / Wankel
            result = Math.floor(displacement * 2 + co2diff * 2);
            result = Math.floor(result / 12 * months);
        } else if (engine === 'c2') { // Diesel
            result = Math.floor(displacement * 9.5 + co2diff * 2);
            result = Math.floor(result / 12 * months);
        }
    } else if (registration === 'a3') { // Euro 3, D3 und besser + EZ 01.01.2012 - 31.12.2013
        co2diff = 0;
        if (co2 > 110) {
            co2diff = co2 - 110;
        }

        if (engine === 'c1') { // Benziner / Wankel
            result = Math.floor(displacement * 2 + co2diff * 2);
            result = Math.floor(result / 12 * months);
        } else if (engine === 'c2') { // Diesel
            result = Math.floor(displacement * 9.5 + co2diff * 2);
            result = Math.floor(result / 12 * months);
        }
    } else if (registration === 'a4') { // Euro 3, D3 und besser + EZ ab 01.01.2014 - 21.12.2020
        co2diff = 0;
        if (co2 > 95) {
            co2diff = co2 - 95;
        }

        if (engine === 'c1') { // Benziner / Wankel
            result = Math.floor(displacement * 2 + co2diff * 2);
            result = Math.floor(result / 12 * months);
        } else if (engine === 'c2') { // Diesel
            result = Math.floor(displacement * 9.5 + co2diff * 2);
            result = Math.floor(result / 12 * months);
        }
    } else if (registration === 'a5') { // Euro 3, D3 und besser + EZ ab 01.01.2021
        co2level = 0;

        if (co2 > 95) {
            co2level += Math.min((co2 - 95) * 2, 40);
        }

        if (co2 > 115) {
            co2level += Math.min((co2 - 115) * 2.2, 44);
        }

        if (co2 > 135) {
            co2level += Math.min((co2 - 135) * 2.5, 50);
        }

        if (co2 > 155) {
            co2level += Math.min((co2 - 155) * 2.9, 58);
        }

        if (co2 > 175) {
            co2level += Math.min((co2 - 175) * 3.4, 68);
        }

        if (co2 > 195) {
            co2level += (co2 - 195) * 4;
        }

        if (engine === 'c1') { // Benziner / Wankel
            result = Math.floor(displacement * 2 + co2level);
            result = Math.floor(result / 12 * months);
        } else if (engine === 'c2') { // Diesel
            result = Math.floor(displacement * 9.5 + co2level);
            result = Math.floor(result / 12 * months);
        }
    }

    return result;
}

function printResult(state) {
    const price = parseInt(state.price, 10);

    elementResultValue.textContent = `${formatTax(price)} €`;
}






if (
    elementCo2Input &&
    elementDisplacementInput &&
    elementEmissionSelect &&
    elementEngineSelect &&
    elementMonths &&
    elementMonthsSelectFrom &&
    elementMonthsSelectTo &&
    elementRegistrationSelect &&
    elementResult &&
    elementResultValue &&
    elementSeasonalBtn &&
    elementStandardBtn
) {
    let state = {
        co2: 0,
        displacement: 0,
        emission: '',
        engine: '',
        months: 12,
        period: 'standard',
        price: 0,
        registration: '',
    };



    elementDisplacementInput.addEventListener('input', (event) => {
        state.displacement = elementDisplacementInput.value || 0;
        state.price = calculateTax(state);

        printResult(state);
    }, false);



    elementCo2Input.addEventListener('input', (event) => {
        state.co2 = elementCo2Input.value;
        state.price = calculateTax(state);

        printResult(state);
    }, false);



    elementEmissionSelect.addEventListener('input', (event) => {
        state.emission = elementEmissionSelect.options[elementEmissionSelect.selectedIndex].value;
        state.price = calculateTax(state);

        printResult(state);
    }, false);



    elementEngineSelect.addEventListener('input', (event) => {
        state.engine = elementEngineSelect.options[elementEngineSelect.selectedIndex].value;
        state.price = calculateTax(state);

        printResult(state);
    }, false);



    elementRegistrationSelect.addEventListener('input', (event) => {
        state.registration = elementRegistrationSelect.options[elementRegistrationSelect.selectedIndex].value;
        state.price = calculateTax(state);
        printResult(state);

        const input = new Event('input', {bubbles: true, cancelable: true});

        if (state.registration === '') {
            elementCo2.hidden = true;
            elementEmission.hidden = true;
        } else if (state.registration === 'a1') {
            elementCo2.hidden = true;
            elementEmission.hidden = false;
        } else {
            elementCo2.hidden = false;
            elementEmission.hidden = true;
        }
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
