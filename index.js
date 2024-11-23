/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2024 Taufik Nurrohman <https://github.com/taufik-nurrohman>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
(function (g, f) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = f() : typeof define === 'function' && define.amd ? define(f) : (g = typeof globalThis !== 'undefined' ? globalThis : g || self, (g.TextEditor = g.TextEditor || {}, g.TextEditor.Key = f()));
})(this, (function () {
    'use strict';
    var isArray = function isArray(x) {
        return Array.isArray(x);
    };
    var isDefined = function isDefined(x) {
        return 'undefined' !== typeof x;
    };
    var isFunction = function isFunction(x) {
        return 'function' === typeof x;
    };
    var isInstance = function isInstance(x, of, exact) {
        if (!x || 'object' !== typeof x) {
            return false;
        } {
            return isSet(of) && isSet(x.constructor) && of === x.constructor;
        }
    };
    var isNull = function isNull(x) {
        return null === x;
    };
    var isObject = function isObject(x, isPlain) {
        if (isPlain === void 0) {
            isPlain = true;
        }
        if (!x || 'object' !== typeof x) {
            return false;
        }
        return isPlain ? isInstance(x, Object) : true;
    };
    var isSet = function isSet(x) {
        return isDefined(x) && !isNull(x);
    };
    var isString = function isString(x) {
        return 'string' === typeof x;
    };

    function Key(self) {
        var $ = this;
        $.commands = {};
        $.key = null;
        $.keys = {};
        $.self = self || $;
        $.set = new Set();
        return $;
    }
    var $$ = Key.prototype;
    $$.command = function (v) {
        var $ = this;
        if (isString(v)) {
            return v === $.toString();
        }
        var command = $.keys[$.toString()];
        return isSet(command) ? command : false;
    };
    $$.fire = function (command, data) {
        var $ = this;
        var self = $.self || $,
            value,
            exist;
        data = data || [];
        if (isFunction(command)) {
            value = command.apply(self, data);
            exist = true;
        } else if (isString(command) && (command = $.commands[command])) {
            value = command.apply(self, data);
            exist = true;
        } else if (isArray(command)) {
            if (isArray(command[1])) {
                command[1].forEach(function (v, k) {
                    return isSet(v) && (data[k] = v);
                });
            }
            if (command = $.commands[command[0]]) {
                value = command.apply(self, data);
                exist = true;
            }
        }
        return exist ? isSet(value) ? value : true : null;
    };
    $$.pull = function (key) {
        var $ = this;
        $.key = null;
        if (!isSet(key)) {
            return $.set = new Set(), $;
        }
        return $.set.delete(key), $;
    };
    $$.push = function (key) {
        var $ = this;
        return $.set.add($.key = key, 1), $;
    };
    $$.toArray = function () {
        return Array.from(this.set);
    };
    $$.toString = function () {
        return this.toArray().join('-');
    };
    Object.defineProperty(Key, 'name', {
        value: 'Key'
    });
    var debounce = function debounce(then, time) {
        var timer;
        return function () {
            var _arguments = arguments,
                _this = this;
            timer && clearTimeout(timer);
            timer = setTimeout(function () {
                return then.apply(_this, _arguments);
            }, time);
        };
    };
    var hasValue = function hasValue(x, data) {
        return -1 !== data.indexOf(x);
    };
    var toCount = function toCount(x) {
        return x.length;
    };
    var _fromStates = function fromStates() {
        for (var _len = arguments.length, lot = new Array(_len), _key = 0; _key < _len; _key++) {
            lot[_key] = arguments[_key];
        }
        var out = lot.shift();
        for (var i = 0, j = toCount(lot); i < j; ++i) {
            for (var k in lot[i]) {
                // Assign value
                if (!isSet(out[k])) {
                    out[k] = lot[i][k];
                    continue;
                }
                // Merge array
                if (isArray(out[k]) && isArray(lot[i][k])) {
                    out[k] = [ /* Clone! */ ].concat(out[k]);
                    for (var ii = 0, jj = toCount(lot[i][k]); ii < jj; ++ii) {
                        if (!hasValue(lot[i][k][ii], out[k])) {
                            out[k].push(lot[i][k][ii]);
                        }
                    }
                    // Merge object recursive
                } else if (isObject(out[k]) && isObject(lot[i][k])) {
                    out[k] = _fromStates({
                        /* Clone! */ }, out[k], lot[i][k]);
                    // Replace value
                } else {
                    out[k] = lot[i][k];
                }
            }
        }
        return out;
    };
    var offEventDefault = function offEventDefault(e) {
        return e && e.preventDefault();
    };
    var offEventPropagation = function offEventPropagation(e) {
        return e && e.stopPropagation();
    };
    var bounce = debounce(function (map, e) {
        // Remove all key(s)
        map.pull();
        // Make the `Alt`, `Control`, `Meta`, and `Shift` key(s) sticky (does not require the user to release all key(s) first to repeat or change the current key combination).
        e.altKey && map.push('Alt');
        e.ctrlKey && map.push('Control');
        e.metaKey && map.push('Meta');
        e.shiftKey && map.push('Shift');
    }, 1000);
    var name = 'TextEditor.Key';
    var references = new WeakMap();

    function getReference(key) {
        return references.get(key) || null;
    }

    function letReference(key) {
        return references.delete(key);
    }

    function onBlur(e) {
        var $ = this,
            map = getReference($);
        map.pull(); // Reset all key(s)
    }

    function onFocus(e) {
        onBlur.call(this, e);
    }

    function onKeyDown(e) {
        var $ = this,
            command,
            v,
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
        var $ = this,
            key = e.key,
            map = getReference($);
        key && map.pull(key); // Reset current key.
    }

    function setReference(key, value) {
        return references.set(key, value);
    }

    function attach() {
        var $ = this;
        var $$ = $.constructor._;
        var map = new Key($);
        $.commands = _fromStates($.commands = map.commands, $.state.commands || {});
        $.keys = _fromStates($.keys = map.keys, $.state.keys || {});
        !isFunction($$.command) && ($$.command = function (command, of) {
            var $ = this;
            return $.commands[command] = of, $;
        });
        !isFunction($$.k) && ($$.k = function (join) {
            var $ = this,
                map = getReference($),
                keys = map.toArray();
            return false === join ? keys : keys.join(join || '-');
        });
        !isFunction($$.key) && ($$.key = function (key, of) {
            var $ = this;
            return $.keys[key] = of, $;
        });
        $.on('blur', onBlur);
        $.on('focus', onFocus);
        $.on('key.down', onKeyDown);
        $.on('key.up', onKeyUp);
        return setReference($, map), $;
    }

    function detach() {
        var $ = this,
            map = getReference($);
        map.pull();
        $.off('blur', onBlur);
        $.off('focus', onFocus);
        $.off('key.down', onKeyDown);
        $.off('key.up', onKeyUp);
        return letReference($), $;
    }
    var index_js = {
        attach: attach,
        detach: detach,
        name: name
    };
    return index_js;
}));