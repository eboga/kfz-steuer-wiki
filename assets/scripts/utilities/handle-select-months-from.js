export default function handleSelectMonthsFrom(selectFrom, selectTo) {
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
