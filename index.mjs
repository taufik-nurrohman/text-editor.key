import Key from '@taufik-nurrohman/key';
import {debounce} from '@taufik-nurrohman/tick';
import {fromStates} from '@taufik-nurrohman/from';
import {isFunction, isSet} from '@taufik-nurrohman/is';
import {offEventDefault, offEventPropagation} from '@taufik-nurrohman/event';

const bounce = debounce((map, e) => {
    // Remove all keys
    map.pull();
    // Make the `Alt`, `Control`, and `Shift` keys sticky (does not require the user to release all keys first to repeat or change the current key combination).
    e.altKey && map.push('Alt');
    e.ctrlKey && map.push('Control');
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
    $._event = e;
    map.pull(); // Reset all key(s)
}

function onInput(e) {
    onBlur.call(this, e);
}

function onKeyDown(e) {
    let $ = this;
    let command, map = getReference($), v;
    // Make the `Alt`, `Control`, and `Shift` keys sticky (does not require the user to release all keys first to repeat or change the current key combination).
    map[e.altKey ? 'push' : 'pull']('Alt');
    map[e.ctrlKey ? 'push' : 'pull']('Control');
    map[e.shiftKey ? 'push' : 'pull']('Shift');
    // Add the actual key to the queue. Don’t worry, this will not mistakenly add a key that already exists in the queue.
    map.push(e.key);
    $._event = e;
    if (command = map.command()) {
        v = map.fire(command);
        if (false === v) {
            offEventDefault(e);
            offEventPropagation(e);
        } else if (null === v) {
            console.warn('Unknown command: `' + command + '`');
        }
    }
    bounce(map, e); // Reset all key(s) after 1 second idle.
}

function onKeyUp(e) {
    let $ = this,
        map = getReference($);
    $._event = e;
    map.pull(e.key); // Reset current key.
}

function setReference(key, value) {
    return references.set(key, value);
}

function attach() {
    const $ = this;
    const $$ = $.constructor.prototype;
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
    $.on('input', onInput);
    $.on('key.down', onKeyDown);
    $.on('key.up', onKeyUp);
    return setReference($, map), $;
}

function detach() {
    let $ = this,
        map = getReference($);
    map.pull();
    $.off('blur', onBlur);
    $.off('input', onInput);
    $.off('key.down', onKeyDown);
    $.off('key.up', onKeyUp);
    return letReference($), $;
}

export default {attach, detach, name};