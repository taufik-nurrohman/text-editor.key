import Key from '@taufik-nurrohman/key';
import {debounce} from '@taufik-nurrohman/tick';
import {fromStates} from '@taufik-nurrohman/from';
import {isFunction, isSet} from '@taufik-nurrohman/is';
import {offEventDefault, offEventPropagation} from '@taufik-nurrohman/event';

const bounce = debounce(map => map.pull(), 1000);
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
    map.push(e.key); // Add current key to the queue
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
    bounce(map); // Reset all key(s) after 1 second idle
}

function onKeyUp(e) {
    let $ = this,
        map = getReference($);
    $._event = e;
    map.pull(e.key); // Reset current key
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
            key = map + "", keys;
        if (isSet(join) && '-' !== join) {
            keys = "" !== key ? key.split(/-(?!$)/) : [];
            if (false !== join) {
                return keys.join(join);
            }
        }
        if (false === join) {
            if ('-' === key) {
                return [key];
            }
            return keys;
        }
        return key;
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