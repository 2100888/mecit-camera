// Consists of JSON object that acts as a 'linked list', can include additional features in the future
const options = {
    'photo': {
        'previous': 'orientation',
        'next': 'photo'
    },
    'orientation': {
        'previous': 'orientation',
        'next': 'photo'
    }
};

/*
    Function that allows user to navigate available options upon winking:
    - Left eye: Navigate to previous option
    - Right eye: Navigate to next option
*/
export function navigateOptions(winkDirection, currentElement) {
    if (winkDirection === 'left') {
        return options[currentElement].previous;
    } else if (winkDirection === 'right') {
        return options[currentElement].next;
    }
};
