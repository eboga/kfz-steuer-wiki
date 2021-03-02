function calculateDays(selectFrom, selectTo) {
    const year = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    const from = parseInt(selectFrom.options[selectFrom.selectedIndex].value, 10);
    const to = parseInt(selectTo.options[selectTo.selectedIndex].value, 10);

    let result = 0;

    for (let i = 0; i < year.length; i++) {
        const days = year[i];
        const month = i + 1;

        if (from <= month && month <= to) {
            result += days;
        }
    }

    return result;
}



function formatTax(price) {
    price = parseFloat(price, 10);

    const grouping = '.';
    const separator = ',';
    const precision = 2;

    const split = price.toFixed(precision).split('.');
    const integer = split[0];
    const fractional = split[1];

    const formatted = integer.replace(
        /^\d+/,
        (number) => [...number].map(
            (digit, index, digits) => {
                let result = '';

                if (!index || (digits.length - index) % 3) {
                    result += '';
                } else {
                    result += grouping;
                }

                result += digit;

                return result;
            }
        ).join(''),
    );

    let result = formatted;
    if (fractional.length > 0) {
        result += separator + fractional;
    }

    return result;
}



function handleSelectMonthsFrom(selectFrom, selectTo) {
    const month = selectFrom.options[selectFrom.selectedIndex].textContent;

    let contains = false;

    for (let i = 0; i < selectTo.options.length; i++) {
        const option = selectTo.options[i];
        const text = option.textContent
        option.hidden = false;
        if (contains === false && text === month) {
            contains = true;
        }
    }

    for (let i = 0; i < selectTo.options.length; i++) {
        const option = selectTo.options[i];
        const text = option.textContent

        if (contains === true) {
            option.hidden = true;
        }

        if (text === month) {
            selectTo.selectedIndex = i + 1;
            break;
        }
    }

    if (contains === false) {
        selectTo.selectedIndex = 0;
    }
}






(function() {
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
        const days = parseInt(state.days, 10);

        if (displacement < 125) {
            return 0;
        }

        result = Math.ceil(displacement / 25);
        result = Math.floor(result * 1.84);
        result = Math.floor(days * result / 365);

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
            days: 365,
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
                state.days = 365;
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
                state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
                state.price = calculateTax(state);

                printResult(state);
            }
        }, false);






        elementMonthsSelectFrom.addEventListener('change', (event) => {
            handleSelectMonthsFrom(elementMonthsSelectFrom, elementMonthsSelectTo)

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);
    }
})();






(function() {
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
        const days = parseInt(state.days, 10) || 0;
        const registration = state.registration;

        let co2diff = 0;
        let co2level = 0;

        if (registration === 'a1') { // EZ bis 30.06.2009
            if (emission === 'b1') { // Euro 3, D3 und besser
                if (engine === 'c1') { // Benziner / Wankel
                    result = Math.floor(displacement * 6.75);
                    result = Math.floor(days * result / 365);
                } else if (engine === 'c2') { // Diesel
                    result = Math.floor(displacement * 15.44);
                    result = Math.floor(days * result / 365);
                }
            } else if (emission === 'b2') { // EURO 2
                if (engine === 'c1') { // Benziner / Wankel
                    result = Math.floor(displacement * 7.36);
                    result = Math.floor(days * result / 365);
                } else if (engine === 'c2') { // Diesel
                    result = Math.floor(displacement * 16.05);
                    result = Math.floor(days * result / 365);
                }
            } else if (emission === 'b3') { // EURO 1
                if (engine === 'c1') { // Benziner / Wankel
                    result = Math.floor(displacement * 15.13);
                    result = Math.floor(days * result / 365);
                } else if (engine === 'c2') { // Diesel
                    result = Math.floor(displacement * 27.35);
                    result = Math.floor(days * result / 365);
                }
            } else if (emission === 'b4') { // nicht schadstoffarm (Fahren bei Ozonalarm erlaubt)
                if (engine === 'c1') { // Benziner / Wankel
                    result = Math.floor(displacement * 21.07);
                    result = Math.floor(days * result / 365);
                } else if (engine === 'c2') { // Diesel
                    result = Math.floor(displacement * 33.29);
                    result = Math.floor(days * result / 365);
                }
            } else if (emission === 'b5') { // übrige
                if (engine === 'c1') { // Benziner / Wankel
                    result = Math.floor(displacement * 25.36);
                    result = Math.floor(days * result / 365);
                } else if (engine === 'c2') { // Diesel
                    result = Math.floor(displacement * 37.58);
                    result = Math.floor(days * result / 365);
                }
            }
        } else if (registration === 'a2') { // Euro 3, D3 und besser + EZ 01.07.2009 - 31.12.2011
            co2diff = 0;
            if (co2 > 120) {
                co2diff = co2 - 120;
            }

            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 2 + co2diff * 2);
                result = Math.floor(days * result / 365);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 9.5 + co2diff * 2);
                result = Math.floor(days * result / 365);
            }
        } else if (registration === 'a3') { // Euro 3, D3 und besser + EZ 01.01.2012 - 31.12.2013
            co2diff = 0;
            if (co2 > 110) {
                co2diff = co2 - 110;
            }

            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 2 + co2diff * 2);
                result = Math.floor(days * result / 365);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 9.5 + co2diff * 2);
                result = Math.floor(days * result / 365);
            }
        } else if (registration === 'a4') { // Euro 3, D3 und besser + EZ ab 01.01.2014 - 21.12.2020
            co2diff = 0;
            if (co2 > 95) {
                co2diff = co2 - 95;
            }

            if (engine === 'c1') { // Benziner / Wankel
                result = Math.floor(displacement * 2 + co2diff * 2);
                result = Math.floor(days * result / 365);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 9.5 + co2diff * 2);
                result = Math.floor(days * result / 365);
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
                result = Math.floor(days * result / 365);
            } else if (engine === 'c2') { // Diesel
                result = Math.floor(displacement * 9.5 + co2level);
                result = Math.floor(days * result / 365);
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
            days: 365,
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
                state.days = 365;
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
                state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
                state.price = calculateTax(state);

                printResult(state);
            }
        }, false);



        elementMonthsSelectFrom.addEventListener('change', (event) => {
            handleSelectMonthsFrom(elementMonthsSelectFrom, elementMonthsSelectTo)

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);
    }
})();






(function() {
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
        const days = parseInt(state.days, 10) || 0;
        const semitrailer = parseInt(state.semitrailer, 10) || 0;
        const total = parseInt(state.total, 10) || 0;

        result = semitrailer * drawbar;
        result = total - result;
        result = Math.ceil(result / 200);
        result = Math.floor(result * 7.46);
        result = Math.min(result, 373.24);
        result = Math.floor(days * result / 365);

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
            days: 365,
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
                state.days = 365;
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
                state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
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

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);
    }
})();






(function() {
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
        const days = parseInt(state.days, 10);

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

        result = days * (result * 0.5) / 365;

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
            days: 365,
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
                state.days = 365;
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
                state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
                state.price = calculateTax(state);

                printResult(state);
            }
        }, false);



        elementMonthsSelectFrom.addEventListener('change', (event) => {
            handleSelectMonthsFrom(elementMonthsSelectFrom, elementMonthsSelectTo)

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);
    }
})();






(function() {
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
        const days = parseInt(state.days, 10);

        if (type === 1) {
            result = Math.floor(191.73);
        } else if (type === 2) {
            result = Math.floor(46.02);
        } else {
            return 0;
        }

        result = Math.floor(days * result / 365);

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
            days: 365,
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
                state.days = 365;
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
                state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
                state.price = calculateTax(state);

                printResult(state);
            }
        }, false);



        elementMonthsSelectFrom.addEventListener('change', (event) => {
            handleSelectMonthsFrom(elementMonthsSelectFrom, elementMonthsSelectTo)

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);
    }
})();






(function() {
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
        const days = parseInt(state.days, 10);

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
        result = days * result / 365;

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
            days: 365,
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
                state.days = 365;
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
                state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
                state.price = calculateTax(state);

                printResult(state);
            }
        }, false);



        elementMonthsSelectFrom.addEventListener('change', (event) => {
            handleSelectMonthsFrom(elementMonthsSelectFrom, elementMonthsSelectTo)

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);
    }
})();






(function() {
    const elementDrawbar = document.querySelector('.jsCalcTrailerDrawbar');
    const elementDrawbarInput = document.querySelector('.jsCalcTrailerDrawbarInput');
    const elementMonths = document.querySelector('.jsCalcTrailerMonths');
    const elementMonthsSelectFrom = document.querySelector('.jsCalcTrailerMonthsSelectFrom');
    const elementMonthsSelectTo = document.querySelector('.jsCalcTrailerMonthsSelectTo');
    const elementResult = document.querySelector('.jsCalcTrailerResult');
    const elementResultValue = document.querySelector('.jsCalcTrailerResultValue');
    const elementSeasonalBtn = document.querySelector('.jsCalcTrailerSeasonalBtn');
    const elementSemitrailerSelect = document.querySelector('.jsCalcTrailerSemitrailerSelect');
    const elementStandardBtn = document.querySelector('.jsCalcTrailerStandardBtn');
    const elementTotalInput = document.querySelector('.jsCalcTrailerTotalInput');






    function calculateTax(state) {
        let result = 0;

        const drawbar = parseInt(state.drawbar, 10) || 0;
        const days = parseInt(state.days, 10) || 0;
        const semitrailer = parseInt(state.semitrailer, 10) || 0;
        const total = parseInt(state.total, 10) || 0;

        result = semitrailer * drawbar;
        result = total - result;
        result = Math.ceil(result / 200);
        result = Math.floor(result * 7.46);
        result = Math.min(result, 373.24);
        result = Math.floor(days * result / 365);

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
            days: 365,
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
                state.days = 365;
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
                state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
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

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);
    }
})();






(function() {
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
        const days = parseInt(state.days, 10);
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

        result = Math.min(result, maximum);

        result = days * result / 365;

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
            days: 365,
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
                state.days = 365;
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
                state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
                state.price = calculateTax(state);

                printResult(state);
            }
        }, false);



        elementMonthsSelectFrom.addEventListener('change', (event) => {
            handleSelectMonthsFrom(elementMonthsSelectFrom, elementMonthsSelectTo)

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);
            state.price = calculateTax(state);

            printResult(state);
        }, false);
    }
})();
