import Key from '@taufik-nurrohman/key';
import {debounce} from '@taufik-nurrohman/tick';
import {fromStates} from '@taufik-nurrohman/from';
import {onEvent, offEvent, offEventDefault} from '@taufik-nurrohman/event';

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

function attach(self) {
    let $ = this;
    let map = new Key($);
    $.command = (command, of) => (($.commands[command] = of), $);
    $.commands = fromStates(map.commands, $.state.commands || {});
    $.k = join => {
        let key = map + "",
            keys;
        if ('-' !== join) {
            keys = key.split(/(?<!-)-/);
            if (false !== join) {
                return keys.join(join);
            }
        }
        if (false === join) {
            return keys;
        }
        return key;
    };
    $.key = (key, of) => (($.keys[key] = of), $);
    $.keys = fromStates(map.keys, $.state.keys || {});
    onEvent('blur', self, onBlur);
    onEvent('input', self, onInput);
    onEvent('keydown', self, onKeyDown);
    onEvent('keyup', self, onKeyUp);
    self[id] = map;
}

function detach(self) {
    delete self[id];
    offEvent('blur', self, onBlur);
    offEvent('input', self, onInput);
    offEvent('keydown', self, onKeyDown);
    offEvent('keyup', self, onKeyUp);
}

export default {attach, detach};