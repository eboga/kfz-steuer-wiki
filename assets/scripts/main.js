// Kfz-Steuer-Rechner von kfz-steuer.wiki / kfz-steuer.co. Jeder Rechner steckt weiter unten in einer
// eigenen Funktion (Kraftrad, Pkw, Wohnwagen, Elektro, Oldtimer, Wohnmobil, Anhänger, Lkw); die
// Rechenwege folgen § 9 KraftStG. Geprüft wird die Logik ohne Browser mit pruefe-rechner-js.py
// (content.qmedia.de, docs/research/kfz-steuer.wiki/_gemeinsam/).

// Steuer für den Anmeldezeitraum: je Tag 1/365 der Jahressteuer (§ 11 Abs. 4 KraftStG); erst der zu
// zahlende Betrag wird auf volle Euro abgerundet (§ 11 Abs. 5). Die Jahressteuer darf also vorher
// nicht gerundet werden. Das Epsilon fängt Gleitkomma-Reste wie 95,9999999 ab; ein echter Bruchteil
// ist mindestens 1/36.500 groß und kann dadurch nie eine Stufe zu hoch landen.
function taxForPeriod(annualTax, days) {
    return Math.floor(annualTax * days / 365 + 1e-9);
}

// Gewichtsstaffel: je angefangene 200 kg der Satz der jeweiligen Gewichtsstufe. Die ersten 2.000 kg
// zählen immer mit dem ersten Satz, erst das Gewicht darüber mit dem nächsten (Zoll, „Berechnung der
// Jahressteuer nach den gewichtsorientierten Staffelsteuersätzen").
function weightBracketTax(totalMass, brackets) {
    let result = 0;

    for (const bracket of brackets) {
        if (totalMass <= bracket.min) {
            break;
        }

        result += Math.ceil((Math.min(totalMass, bracket.max) - bracket.min) / 200) * bracket.multiplier;
    }

    return result;
}

// Nutzfahrzeuge über 3.500 kg (§ 9 Abs. 1 Nr. 4 KraftStG): Staffel je angefangene 200 kg mit
// Höchstbetrag je Klasse. Die Schlüssel sind die Werte der Schadstoffklassen-Auswahl im Lkw-Rechner:
// a1 = S 2 und besser, a2 = S 1, a3 = G 1, a4 = übrige. Die S-2-Staffel gilt zur Hälfte auch für
// Elektrofahrzeuge über 3.500 kg (§ 9 Abs. 2).
const TRUCK_RATES = {
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
            { min: 12000, max: Infinity, multiplier: 14.32 },
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
            { min: 15000, max: Infinity, multiplier: 36.23 },
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
            { min: 15000, max: Infinity, multiplier: 54.35 },
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
            { min: 15000, max: Infinity, multiplier: 63.4 },
        ],
    },
};



// Tage eines Saisonzeitraums (Monat von … bis); der 29.02. zählt nicht mit (§ 11 Abs. 4 Satz 4 KraftStG).
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






    // 1,84 € je angefangene 25 cm³ Hubraum (§ 9 Abs. 1 Nr. 1 KraftStG). Unter 125 cm³ gilt das Kraftrad
    // als steuerfreies Leichtkraftrad – die zweite Bedingung (höchstens 11 kW) kann der Rechner nicht prüfen.
    function calculateTax(state) {
        const displacement = parseInt(state.displacement, 10);
        const days = parseInt(state.days, 10);

        if (displacement < 125) {
            return 0;
        }

        return taxForPeriod(Math.ceil(displacement / 25) * 1.84, days);
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






    // Jahressteuer nach § 9 Abs. 1 Nr. 2 KraftStG je nach Erstzulassung (a1–a5), Motorart (c1 Benziner/
    // Wankel, c2 Diesel) und bei a1 der Schadstoffklasse (b1–b5). Hubraum je angefangene 100 cm³.
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
                    result = taxForPeriod(displacement * 6.75, days);
                } else if (engine === 'c2') { // Diesel
                    result = taxForPeriod(displacement * 15.44, days);
                }
            } else if (emission === 'b2') { // EURO 2
                if (engine === 'c1') { // Benziner / Wankel
                    result = taxForPeriod(displacement * 7.36, days);
                } else if (engine === 'c2') { // Diesel
                    result = taxForPeriod(displacement * 16.05, days);
                }
            } else if (emission === 'b3') { // EURO 1
                if (engine === 'c1') { // Benziner / Wankel
                    result = taxForPeriod(displacement * 15.13, days);
                } else if (engine === 'c2') { // Diesel
                    result = taxForPeriod(displacement * 27.35, days);
                }
            } else if (emission === 'b4') { // nicht schadstoffarm (Fahren bei Ozonalarm erlaubt)
                if (engine === 'c1') { // Benziner / Wankel
                    result = taxForPeriod(displacement * 21.07, days);
                } else if (engine === 'c2') { // Diesel
                    result = taxForPeriod(displacement * 33.29, days);
                }
            } else if (emission === 'b5') { // übrige
                if (engine === 'c1') { // Benziner / Wankel
                    result = taxForPeriod(displacement * 25.36, days);
                } else if (engine === 'c2') { // Diesel
                    result = taxForPeriod(displacement * 37.58, days);
                }
            }
        } else if (registration === 'a2') { // Euro 3, D3 und besser + EZ 01.07.2009 - 31.12.2011
            co2diff = 0;
            if (co2 > 120) {
                co2diff = co2 - 120;
            }

            if (engine === 'c1') { // Benziner / Wankel
                result = taxForPeriod(displacement * 2 + co2diff * 2, days);
            } else if (engine === 'c2') { // Diesel
                result = taxForPeriod(displacement * 9.5 + co2diff * 2, days);
            }
        } else if (registration === 'a3') { // Euro 3, D3 und besser + EZ 01.01.2012 - 31.12.2013
            co2diff = 0;
            if (co2 > 110) {
                co2diff = co2 - 110;
            }

            if (engine === 'c1') { // Benziner / Wankel
                result = taxForPeriod(displacement * 2 + co2diff * 2, days);
            } else if (engine === 'c2') { // Diesel
                result = taxForPeriod(displacement * 9.5 + co2diff * 2, days);
            }
        } else if (registration === 'a4') { // Euro 3, D3 und besser + EZ ab 01.01.2014 - 31.12.2020
            co2diff = 0;
            if (co2 > 95) {
                co2diff = co2 - 95;
            }

            if (engine === 'c1') { // Benziner / Wankel
                result = taxForPeriod(displacement * 2 + co2diff * 2, days);
            } else if (engine === 'c2') { // Diesel
                result = taxForPeriod(displacement * 9.5 + co2diff * 2, days);
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
                result = taxForPeriod(displacement * 2 + co2level, days);
            } else if (engine === 'c2') { // Diesel
                result = taxForPeriod(displacement * 9.5 + co2level, days);
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






    // 7,46 € je angefangene 200 kg, höchstens 373,24 € im Jahr (§ 9 Abs. 1 Nr. 5 KraftStG). Bei Sattel-,
    // Starrdeichsel- und Zentralachsanhängern wird das zulässige Gesamtgewicht vorher um die Aufliege-
    // bzw. Stützlast vermindert (§ 8 Nr. 2 Satz 2).
    function calculateTax(state) {
        const drawbar = parseInt(state.drawbar, 10) || 0;
        const days = parseInt(state.days, 10) || 0;
        const semitrailer = parseInt(state.semitrailer, 10) || 0;
        const total = parseInt(state.total, 10) || 0;

        const taxableMass = total - semitrailer * drawbar;
        const annualTax = Math.min(Math.ceil(taxableMass / 200) * 7.46, 373.24);

        return taxForPeriod(annualTax, days);
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






// Elektrofahrzeuge (§ 3d und § 9 Abs. 2 KraftStG). Der Rechner fragt Erstzulassung und zulässiges
// Gesamtgewicht ab: Solange die Befreiung nach § 3d läuft, zeigt er 0 € und nennt ihren letzten Tag
// samt der Steuer danach; sonst zeigt er die halbierte Gewichtssteuer. Die Hinweistexte stehen als
// data-Attribute am Hinweis-Element der Seite (Platzhalter {date} und {tax}).
(function() {
    const elementMonths = document.querySelector('.jsCalcEvMonths');
    const elementMonthsSelectFrom = document.querySelector('.jsCalcEvMonthsSelectFrom');
    const elementMonthsSelectTo = document.querySelector('.jsCalcEvMonthsSelectTo');
    const elementNote = document.querySelector('.jsCalcEvNote');
    const elementRegistrationInput = document.querySelector('.jsCalcEvRegistrationInput');
    const elementResult = document.querySelector('.jsCalcEvResult');
    const elementResultValue = document.querySelector('.jsCalcEvResultValue');
    const elementSeasonalBtn = document.querySelector('.jsCalcEvSeasonalBtn');
    const elementStandardBtn = document.querySelector('.jsCalcEvStandardBtn');
    const elementTotalInput = document.querySelector('.jsCalcEvTotalInput');

    // Nutzfahrzeuge bis 3.500 kg (§ 9 Abs. 1 Nr. 3 KraftStG): nur nach Gewicht, kein Höchstbetrag.
    const LIGHT_TRUCK_RATES = [
        { min: 0, max: 2000, multiplier: 11.25 },
        { min: 2000, max: 3000, multiplier: 12.02 },
        { min: 3000, max: 3500, multiplier: 12.78 },
    ];






    // Jahressteuer nach Ablauf der Befreiung: die Hälfte der Nutzfahrzeugsteuer (§ 9 Abs. 2) – bis
    // 3.500 kg nach § 9 Abs. 1 Nr. 3, darüber nach der Staffel für S 2 (Nr. 4 lit. a, höchstens 556 €).
    function calculateAnnualTax(totalMass) {
        if (totalMass <= 3500) {
            return weightBracketTax(totalMass, LIGHT_TRUCK_RATES) / 2;
        }

        return Math.min(weightBracketTax(totalMass, TRUCK_RATES.a1.plans), TRUCK_RATES.a1.maximum) / 2;
    }

    // Wert des Datumsfelds (JJJJ-MM-TT) als Datum; null, wenn leer oder unvollständig.
    function parseDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');

        if (!match) {
            return null;
        }

        return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
    }

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        return `${day}.${month}.${date.getFullYear()}`;
    }

    // Letzter Tag der Steuerbefreiung oder null, wenn es keine gibt. Erstzulassung 18.05.2011 bis
    // 31.12.2030: zehn Jahre ab dem Tag der Erstzulassung, längstens bis 31.12.2035 (§ 3d Abs. 1).
    // Erstzulassung bis 17.05.2011: fünf Jahre (§ 18 Abs. 4b), längst abgelaufen. Ab 01.01.2031: keine.
    function exemptionEnd(registration) {
        if (registration > new Date(2030, 11, 31)) {
            return null;
        }

        const years = registration < new Date(2011, 4, 18) ? 5 : 10;
        const end = new Date(registration.getFullYear() + years, registration.getMonth(), registration.getDate() - 1);
        const latest = new Date(2035, 11, 31);

        return end < latest ? end : latest;
    }

    function printResult(state) {
        const registration = parseDate(state.registration);
        const days = parseInt(state.days, 10) || 0;
        const tax = taxForPeriod(calculateAnnualTax(parseInt(state.total, 10) || 0), days);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let taxNow = tax;
        let note;

        if (!registration) {
            taxNow = 0;
            note = elementNote.dataset.missing;
        } else {
            const end = exemptionEnd(registration);

            if (!end) {
                note = elementNote.dataset.noExemption;
            } else if (today <= end) {
                taxNow = 0;
                note = elementNote.dataset.exempt.replace('{date}', formatDate(end));
            } else {
                note = elementNote.dataset.expired.replace('{date}', formatDate(end));
            }
        }

        elementResultValue.textContent = `${formatTax(taxNow)} €`;
        elementNote.innerHTML = note.replace('{tax}', `${formatTax(tax)} €`);
        elementNote.hidden = false;
    }






    if (
        elementMonths &&
        elementMonthsSelectFrom &&
        elementMonthsSelectTo &&
        elementNote &&
        elementRegistrationInput &&
        elementResult &&
        elementResultValue &&
        elementSeasonalBtn &&
        elementStandardBtn &&
        elementTotalInput
    ) {
        let state = {
            days: 365,
            period: 'standard',
            registration: '',
            total: 0,
        };



        elementTotalInput.addEventListener('input', (event) => {
            state.total = elementTotalInput.value || 0;

            printResult(state);
        }, false);



        // Datumsfelder melden je nach Browser 'input' oder 'change'
        ['input', 'change'].forEach((type) => {
            elementRegistrationInput.addEventListener(type, (event) => {
                state.registration = elementRegistrationInput.value;

                printResult(state);
            }, false);
        });



        elementStandardBtn.addEventListener('click', (event) => {
            if (!elementStandardBtn.classList.contains('button-active')) {
                elementStandardBtn.classList.add('button-active');
                elementSeasonalBtn.classList.remove('button-active');
                elementMonths.hidden = true;

                state.period = 'standard';
                state.days = 365;

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

                printResult(state);
            }
        }, false);



        elementMonthsSelectFrom.addEventListener('change', (event) => {
            handleSelectMonthsFrom(elementMonthsSelectFrom, elementMonthsSelectTo)

            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);

            printResult(state);
        }, false);

        elementMonthsSelectTo.addEventListener('change', (event) => {
            state.days = calculateDays(elementMonthsSelectFrom, elementMonthsSelectTo);

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

        // Pauschale Jahressteuer (§ 9 Abs. 4 KraftStG): 191,73 € für Kraftfahrzeuge und Anhänger, 46,02 € für Krafträder
        if (type === 1) {
            result = 191.73;
        } else if (type === 2) {
            result = 46.02;
        } else {
            return 0;
        }

        return taxForPeriod(result, days);
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

        result = Math.min(tax1 + tax2 + tax3 + tax4, maximum);

        return taxForPeriod(result, days);
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






    // 7,46 € je angefangene 200 kg, höchstens 373,24 € im Jahr (§ 9 Abs. 1 Nr. 5 KraftStG). Bei Sattel-,
    // Starrdeichsel- und Zentralachsanhängern wird das zulässige Gesamtgewicht vorher um die Aufliege-
    // bzw. Stützlast vermindert (§ 8 Nr. 2 Satz 2).
    function calculateTax(state) {
        const drawbar = parseInt(state.drawbar, 10) || 0;
        const days = parseInt(state.days, 10) || 0;
        const semitrailer = parseInt(state.semitrailer, 10) || 0;
        const total = parseInt(state.total, 10) || 0;

        const taxableMass = total - semitrailer * drawbar;
        const annualTax = Math.min(Math.ceil(taxableMass / 200) * 7.46, 373.24);

        return taxForPeriod(annualTax, days);
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

        const rates = TRUCK_RATES[emission];

        if (!rates) {
            return 0;
        }

        result = Math.min(weightBracketTax(total, rates.plans), rates.maximum);

        return taxForPeriod(result, days);
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
