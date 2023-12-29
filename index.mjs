import {onEvent, offEvent, offEventDefault} from '@taufik-nurrohman/event';

function onKeyDown(e) {

}

function onKeyUp(e) {

}

function attach(self) {
    let $ = this;
    $.commands = $.commands || {};
    $.keys = $.keys || {};
    onEvent('keydown', self, onKeyDown);
    onEvent('keyup', self, onKeyUp);
}

function detach(self) {
    offEvent('keydown', self, onKeyDown);
    offEvent('keyup', self, onKeyUp);
}

export default {attach, detach};