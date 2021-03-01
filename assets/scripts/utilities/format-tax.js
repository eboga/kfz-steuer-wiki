export default function formatTax(price) {
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
