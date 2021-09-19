function scrollIntoView(element) {
    if (element.scrollIntoViewIfNeeded) {
        element.scrollIntoViewIfNeeded();  // https://stackoverflow.com/a/54515025
    } else {
        let inlineCenter = {behavior: 'auto', block: 'center', inline: 'center'};
        element.scrollIntoView(inlineCenter);
    }
}


export default {scrollIntoView}