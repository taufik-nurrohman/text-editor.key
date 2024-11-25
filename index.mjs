import Key from '@taufik-nurrohman/key';

import {debounce, delay} from '@taufik-nurrohman/tick';
import {fromStates} from '@taufik-nurrohman/from';
import {isFunction, isSet, isString} from '@taufik-nurrohman/is';
import {offEventDefault, offEventPropagation} from '@taufik-nurrohman/event';
import {toCount} from '@taufik-nurrohman/to';

const bounce = debounce((map, e) => {
    // Remove all key(s)
    map.pull();
    // Make the `Alt`, `Control`, `Meta`, and `Shift` key(s) sticky (does not require the user to release all key(s) first to repeat or change the current key combination).
    e.altKey && map.push('Alt');
    e.ctrlKey && map.push('Control');
    e.metaKey && map.push('Meta');
    e.shiftKey && map.push('Shift');
}, 1000);

const name = 'TextEditor.Key';
const references = new WeakMap;

function getReference(key) {
    return references.get(key) || null;
}

function letReference(key) {
    return references.delete(key);
}

function onBlur(e) {
    let $ = this,
        map = getReference($);
    map.pull(); // Reset all key(s)
}

function onFocus(e) {
    onBlur.call(this, e);
}

function onPutDownOrKeyDown(e) {
    let map = getReference(this), command, v,
        {data, inputType, key, type} = e;
    if ('keydown' === type) {
        // Make the `Alt`, `Control`, `Meta`, and `Shift` key(s) sticky (does not require the user to release all key(s) first to repeat or change the current key combination).
        map[e.altKey ? 'push' : 'pull']('Alt');
        map[e.ctrlKey ? 'push' : 'pull']('Control');
        map[e.metaKey ? 'push' : 'pull']('Meta');
        map[e.shiftKey ? 'push' : 'pull']('Shift');
        // Add the actual key to the queue. Don’t worry, this will not mistakenly add a key that already exists in the queue.
        key && map.push(key);
    } else {
        if ('deleteContentBackward' === inputType) {
            map.pull().push('Backspace'); // Simulate `Backspace` key
        } else if ('deleteContentForward' === inputType) {
            map.pull().push('Delete'); // Simulate `Delete` key
        } else if ('deleteWordBackward' === inputType) {
            map.pull().push('Control').push('Backspace'); // Simulate `Control-Backspace` keys
        } else if ('deleteWordForward' === inputType) {
            map.pull().push('Control').push('Delete'); // Simulate `Control-Delete` keys
        } else if ('insertLineBreak' === inputType) {
            map.pull().push('Enter'); // Simulate `Enter` key
        } else if ('insertText' === inputType && data) {
            // One character at a time
            map.toArray().forEach(key => 1 === toCount(key) && map.pull(key));
            map.push(data);
        }
    }
    if (command = map.command()) {
        v = map.fire(command);
        if (false === v) {
            offEventDefault(e);
            offEventPropagation(e);
        } else if (null === v) {
            console.warn('Unknown command:', command);
        }
    }
    bounce(map, e); // Reset all key(s) after 1 second idle.
}

function onPutUpOrKeyUp(e) {
    let map = getReference(this),
        {data, inputType, key, type} = e;
    if ('keyup' === type) {
        map[e.altKey ? 'push' : 'pull']('Alt');
        map[e.ctrlKey ? 'push' : 'pull']('Control');
        map[e.metaKey ? 'push' : 'pull']('Meta');
        map[e.shiftKey ? 'push' : 'pull']('Shift');
        key && map.pull(key);
    } else {
        if ('deleteContentBackward' === inputType) {
            map.pull('Backspace');
        } else if ('deleteContentForward' === inputType) {
            map.pull('Delete');
        } else if ('deleteWordBackward' === inputType) {
            map.pull('Control').pull('Backspace');
        } else if ('deleteWordForward' === inputType) {
            map.pull('Control').pull('Delete');
        } else if ('insertLineBreak' === inputType) {
            map.pull('Enter');
        } else if ('insertText' === inputType && data) {
            map.pull(data);
        }
    }
}

function setReference(key, value) {
    return references.set(key, value);
}

function attach() {
    const $ = this;
    const $$ = $.constructor._;
    const map = new Key($);
    $.commands = fromStates($.commands = map.commands, $.state.commands || {});
    $.keys = fromStates($.keys = map.keys, $.state.keys || {});
    !isFunction($$.command) && ($$.command = function (command, of) {
        let $ = this;
        return ($.commands[command] = of), $;
    });
    !isFunction($$.k) && ($$.k = function (join) {
        let $ = this,
            map = getReference($),
            keys = map.toArray();
        return false === join ? keys : keys.join(join || '-');
    });
    !isFunction($$.key) && ($$.key = function (key, of) {
        let $ = this;
        return ($.keys[key] = of), $;
    });
    $.on('blur', onBlur);
    $.on('focus', onFocus);
    $.on('key.down', onPutDownOrKeyDown);
    $.on('key.up', onPutUpOrKeyUp);
    $.on('put.down', onPutDownOrKeyDown);
    $.on('put.up', onPutUpOrKeyUp);
    return setReference($, map), $;
}

function detach() {
    let $ = this,
        map = getReference($);
    map.pull();
    $.off('blur', onBlur);
    $.off('focus', onFocus);
    $.off('key.down', onPutDownOrKeyDown);
    $.off('key.up', onPutUpOrKeyUp);
    $.off('put.down', onPutDownOrKeyDown);
    $.off('put.up', onPutUpOrKeyUp);
    return letReference($), $;
}

export default {attach, detach, name};