/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2023 Taufik Nurrohman <https://github.com/taufik-nurrohman>
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
    var isNull = function isNull(x) {
        return null === x;
    };
    var isSet = function isSet(x) {
        return isDefined(x) && !isNull(x);
    };
    var isString = function isString(x) {
        return 'string' === typeof x;
    };
    var toObjectKeys = function toObjectKeys(x) {
        return Object.keys(x);
    };

    function Key(self) {
        var $ = this;
        var queue = {};
        $.command = function (v) {
            if (isString(v)) {
                return v === $.toString();
            }
            var command = $.keys[$.toString()];
            return isSet(command) ? command : false;
        };
        $.commands = {};
        $.fire = function (command) {
            var self = $.self || $,
                value,
                exist;
            if (isFunction(command)) {
                value = command.call(self);
                exist = true;
            } else if (isString(command) && (command = $.commands[command])) {
                value = command.call(self);
                exist = true;
            } else if (isArray(command)) {
                var data = command[1] || [];
                if (command = $.commands[command[0]]) {
                    value = command.apply(self, data);
                    exist = true;
                }
            }
            return exist ? isSet(value) ? value : true : null;
        };
        $.key = null;
        $.keys = {};
        $.pull = function (key) {
            $.key = null;
            if (!isSet(key)) {
                return queue = {}, $;
            }
            return delete queue[key], $;
        };
        $.push = function (key) {
            return queue[$.key = key] = 1, $;
        };
        $.self = self;
        $.toString = function () {
            return toObjectKeys(queue).join('-');
        };
        return $;
    }
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
    var offEvent = function offEvent(name, node, then) {
        node.removeEventListener(name, then);
    };
    var offEventDefault = function offEventDefault(e) {
        return e && e.preventDefault();
    };
    var onEvent = function onEvent(name, node, then, options) {
        if (options === void 0) {
            options = false;
        }
        node.addEventListener(name, then, options);
    };

    function onBlur(e) {
        this.Key.pull(); // Reset all key(s)
    }

    function onInput(e) {
        this.Key.pull(); // Reset all key(s)
    }

    function onKeyDown(e) {
        var command,
            map = this.Key,
            v;
        map.push(e.key); // Add current key to the queue
        if (command = map.command()) {
            v = map.fire(command);
            if (false === v) {
                offEventDefault(e);
            } else if (null === v) {
                console.warn('Unknown command: `' + command + '`');
            }
        }
        this.Bounce();
    }

    function onKeyUp(e) {
        this.Key.pull(e.key); // Reset current key
    }

    function attach(self) {
        var $ = this;
        var map = new Key($);
        $.command = function (command, of) {
            return $.commands[command] = of, $;
        };
        $.key = function (key, of) {
            return $.keys[key] = of, $;
        };
        $.commands = map.commands;
        $.keys = map.keys;
        onEvent('blur', self, onBlur);
        onEvent('input', self, onInput);
        onEvent('keydown', self, onKeyDown);
        onEvent('keyup', self, onKeyUp);
        self.Bounce = debounce(function () {
            return map.pull();
        }, 1000); // Reset all key(s) after 1 second idle
        self.Key = map;
    }

    function detach(self) {
        var $ = this;
        delete $.commands;
        delete $.keys;
        delete self.Bounce;
        delete self.Key;
        offEvent('blur', self, onBlur);
        offEvent('input', self, onInput);
        offEvent('keydown', self, onKeyDown);
        offEvent('keyup', self, onKeyUp);
    }
    var index_js = {
        attach: attach,
        detach: detach
    };
    return index_js;
}));