import Key from '@taufik-nurrohman/key';
import {debounce} from '@taufik-nurrohman/tick';
import {fromStates} from '@taufik-nurrohman/from';
import {onEvent, offEvent, offEventDefault} from '@taufik-nurrohman/event';

const bounce = debounce(map => map.pull(), 1000);

function onBlur(e) {
    this.Key.pull(); // Reset all key(s)
}

function onInput(e) {
    this.Key.pull(); // Reset all key(s)
}

function onKeyDown(e) {
    let command, map = this.Key, v;
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
    this.Key.pull(e.key); // Reset current key
}

function attach(self) {
    let $ = this;
    let map = new Key($);
    $.command = (command, of) => (($.commands[command] = of), $);
    $.commands = fromStates(map.commands, $.state.commands || {});
    $.k = () => map + "";
    $.key = (key, of) => (($.keys[key] = of), $);
    $.keys = fromStates(map.keys, $.state.keys || {});
    onEvent('blur', self, onBlur);
    onEvent('input', self, onInput);
    onEvent('keydown', self, onKeyDown);
    onEvent('keyup', self, onKeyUp);
    self.Key = map;
}

function detach(self) {
    let $ = this;
    delete $.commands;
    delete $.keys;
    delete self.Key;
    offEvent('blur', self, onBlur);
    offEvent('input', self, onInput);
    offEvent('keydown', self, onKeyDown);
    offEvent('keyup', self, onKeyUp);
}

export default {attach, detach};