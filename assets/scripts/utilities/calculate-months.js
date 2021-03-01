export default function calculateMonths(selectFrom, selectTo) {
    let result = 0;

    const optionFrom = selectFrom.options[selectFrom.selectedIndex];
    const optionTo = selectTo.options[selectTo.selectedIndex];

    result = optionTo.value - optionFrom.value;
    result = result + 1; // XXX: We need the number of months, not the difference.

    return result;
}
