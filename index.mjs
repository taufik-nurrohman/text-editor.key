import Key from '@taufik-nurrohman/key';
import {debounce} from '@taufik-nurrohman/tick';
import {fromStates} from '@taufik-nurrohman/from';
import {isSet} from '@taufik-nurrohman/is';
import {offEventDefault} from '@taufik-nurrohman/event';

const bounce = debounce(map => map.pull(), 1000);
const id = 'Key_' + Date.now();

function onBlur(e) {
    this[id].pull(); // Reset all key(s)
}

function onInput(e) {
    onBlur.call(this);
}

function onKeyDown(e) {
    let command, map = this[id], v;
    map.push(e.key); // Add current key to the queue
    if (command = map.command()) {
        v = map.fire(command);
        if (false === v) {
            offEventDefault(e);
        } else if (null === v) {
            console.warn('Unknown command: `' + command + '`');
        }
    }
    bounce(map); // Reset all key(s) after 1 second idle
}

function onKeyUp(e) {
    this[id].pull(e.key); // Reset current key
}

function attach() {
    let $ = this;
    let map = new Key($);
    $.command = (command, of) => (($.commands[command] = of), $);
    $.commands = fromStates($.commands = map.commands, $.state.commands || {});
    $.k = join => {
        let key = map + "",
            keys;
        if (isSet(join) && '-' !== join) {
            keys = "" !== key ? key.split(/(?<!-)-/) : [];
            if (false !== join) {
                return keys.join(join);
            }
        }
        if (false === join) {
            if (key === join) {
                return [key];
            }
            return keys;
        }
        return key;
    };
    $.key = (key, of) => (($.keys[key] = of), $);
    $.keys = fromStates($.keys = map.keys, $.state.keys || {});
    $.on('blur', onBlur);
    $.on('input', onInput);
    $.on('key.down', onKeyDown);
    $.on('key.up', onKeyUp);
    $[id] = map;
    return $;
}

function detach() {
    let $ = this;
    $[id].pull();
    $.off('blur', onBlur);
    $.off('input', onInput);
    $.off('key.down', onKeyDown);
    $.off('key.up', onKeyUp);
    delete $[id];
    return $;
}

export default {attach, detach};