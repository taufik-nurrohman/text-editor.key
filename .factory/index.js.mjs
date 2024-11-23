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

function onKeyDown(e) {
    let $ = this, command, v,
        key = e.key,
        map = getReference($);
    // Make the `Alt`, `Control`, `Meta`, and `Shift` key(s) sticky (does not require the user to release all key(s) first to repeat or change the current key combination).
    map[e.altKey ? 'push' : 'pull']('Alt');
    map[e.ctrlKey ? 'push' : 'pull']('Control');
    map[e.metaKey ? 'push' : 'pull']('Meta');
    map[e.shiftKey ? 'push' : 'pull']('Shift');
    // Add the actual key to the queue. Don’t worry, this will not mistakenly add a key that already exists in the queue.
    key && map.push(key);
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

function onKeyUp(e) {
    let $ = this,
        key = e.key,
        map = getReference($);
    key && map.pull(key); // Reset current key.
}

// Partial mobile support
function onPutDown(e) {
    let $ = this,
        key = e.data,
        map = getReference($);
    if (isString(key) && 1 === toCount(key)) {
        // Having 1 printable character to put will discard the other(s)
        map.toArray().forEach(k => isString(k) && 1 === toCount(k) && map.pull(k));
        // Put the current printable character to the list
        map.push(key);
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
    $.on('key.down', onKeyDown);
    $.on('key.up', onKeyUp);
    $.on('put.down', onPutDown);
    return setReference($, map), $;
}

function detach() {
    let $ = this,
        map = getReference($);
    map.pull();
    $.off('blur', onBlur);
    $.off('focus', onFocus);
    $.off('key.down', onKeyDown);
    $.off('key.up', onKeyUp);
    $.off('put.down', onPutDown);
    return letReference($), $;
}

export default {attach, detach, name};