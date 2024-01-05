(function () {
  'use strict';

  const wait = ms => {
    if (typeof ms !== 'number' && ms < 0) {
      throw new Error('ms must be number!');
    }
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  async function getVacancies() {
    await wait(1000);
    return [];
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  var __assign = function () {
    __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var NotyfNotification = /** @class */function () {
    function NotyfNotification(options) {
      this.options = options;
      this.listeners = {};
    }
    NotyfNotification.prototype.on = function (eventType, cb) {
      var callbacks = this.listeners[eventType] || [];
      this.listeners[eventType] = callbacks.concat([cb]);
    };
    NotyfNotification.prototype.triggerEvent = function (eventType, event) {
      var _this = this;
      var callbacks = this.listeners[eventType] || [];
      callbacks.forEach(function (cb) {
        return cb({
          target: _this,
          event: event
        });
      });
    };
    return NotyfNotification;
  }();
  var NotyfArrayEvent;
  (function (NotyfArrayEvent) {
    NotyfArrayEvent[NotyfArrayEvent["Add"] = 0] = "Add";
    NotyfArrayEvent[NotyfArrayEvent["Remove"] = 1] = "Remove";
  })(NotyfArrayEvent || (NotyfArrayEvent = {}));
  var NotyfArray = /** @class */function () {
    function NotyfArray() {
      this.notifications = [];
    }
    NotyfArray.prototype.push = function (elem) {
      this.notifications.push(elem);
      this.updateFn(elem, NotyfArrayEvent.Add, this.notifications);
    };
    NotyfArray.prototype.splice = function (index, num) {
      var elem = this.notifications.splice(index, num)[0];
      this.updateFn(elem, NotyfArrayEvent.Remove, this.notifications);
      return elem;
    };
    NotyfArray.prototype.indexOf = function (elem) {
      return this.notifications.indexOf(elem);
    };
    NotyfArray.prototype.onUpdate = function (fn) {
      this.updateFn = fn;
    };
    return NotyfArray;
  }();
  var NotyfEvent;
  (function (NotyfEvent) {
    NotyfEvent["Dismiss"] = "dismiss";
    NotyfEvent["Click"] = "click";
  })(NotyfEvent || (NotyfEvent = {}));
  var DEFAULT_OPTIONS = {
    types: [{
      type: 'success',
      className: 'notyf__toast--success',
      backgroundColor: '#3dc763',
      icon: {
        className: 'notyf__icon--success',
        tagName: 'i'
      }
    }, {
      type: 'error',
      className: 'notyf__toast--error',
      backgroundColor: '#ed3d3d',
      icon: {
        className: 'notyf__icon--error',
        tagName: 'i'
      }
    }],
    duration: 2000,
    ripple: true,
    position: {
      x: 'right',
      y: 'bottom'
    },
    dismissible: false
  };
  var NotyfView = /** @class */function () {
    function NotyfView() {
      this.notifications = [];
      this.events = {};
      this.X_POSITION_FLEX_MAP = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
      };
      this.Y_POSITION_FLEX_MAP = {
        top: 'flex-start',
        center: 'center',
        bottom: 'flex-end'
      };
      // Creates the main notifications container
      var docFrag = document.createDocumentFragment();
      var notyfContainer = this._createHTMLElement({
        tagName: 'div',
        className: 'notyf'
      });
      docFrag.appendChild(notyfContainer);
      document.body.appendChild(docFrag);
      this.container = notyfContainer;
      // Identifies the main animation end event
      this.animationEndEventName = this._getAnimationEndEventName();
      this._createA11yContainer();
    }
    NotyfView.prototype.on = function (event, cb) {
      var _a;
      this.events = __assign(__assign({}, this.events), (_a = {}, _a[event] = cb, _a));
    };
    NotyfView.prototype.update = function (notification, type) {
      if (type === NotyfArrayEvent.Add) {
        this.addNotification(notification);
      } else if (type === NotyfArrayEvent.Remove) {
        this.removeNotification(notification);
      }
    };
    NotyfView.prototype.removeNotification = function (notification) {
      var _this = this;
      var renderedNotification = this._popRenderedNotification(notification);
      var node;
      if (!renderedNotification) {
        return;
      }
      node = renderedNotification.node;
      node.classList.add('notyf__toast--disappear');
      var handleEvent;
      node.addEventListener(this.animationEndEventName, handleEvent = function (event) {
        if (event.target === node) {
          node.removeEventListener(_this.animationEndEventName, handleEvent);
          _this.container.removeChild(node);
        }
      });
    };
    NotyfView.prototype.addNotification = function (notification) {
      var node = this._renderNotification(notification);
      this.notifications.push({
        notification: notification,
        node: node
      });
      // For a11y purposes, we still want to announce that there's a notification in the screen
      // even if it comes with no message.
      this._announce(notification.options.message || 'Notification');
    };
    NotyfView.prototype._renderNotification = function (notification) {
      var _a;
      var card = this._buildNotificationCard(notification);
      var className = notification.options.className;
      if (className) {
        (_a = card.classList).add.apply(_a, className.split(' '));
      }
      this.container.appendChild(card);
      return card;
    };
    NotyfView.prototype._popRenderedNotification = function (notification) {
      var idx = -1;
      for (var i = 0; i < this.notifications.length && idx < 0; i++) {
        if (this.notifications[i].notification === notification) {
          idx = i;
        }
      }
      if (idx !== -1) {
        return this.notifications.splice(idx, 1)[0];
      }
      return;
    };
    NotyfView.prototype.getXPosition = function (options) {
      var _a;
      return ((_a = options === null || options === void 0 ? void 0 : options.position) === null || _a === void 0 ? void 0 : _a.x) || 'right';
    };
    NotyfView.prototype.getYPosition = function (options) {
      var _a;
      return ((_a = options === null || options === void 0 ? void 0 : options.position) === null || _a === void 0 ? void 0 : _a.y) || 'bottom';
    };
    NotyfView.prototype.adjustContainerAlignment = function (options) {
      var align = this.X_POSITION_FLEX_MAP[this.getXPosition(options)];
      var justify = this.Y_POSITION_FLEX_MAP[this.getYPosition(options)];
      var style = this.container.style;
      style.setProperty('justify-content', justify);
      style.setProperty('align-items', align);
    };
    NotyfView.prototype._buildNotificationCard = function (notification) {
      var _this = this;
      var options = notification.options;
      var iconOpts = options.icon;
      // Adjust container according to position (e.g. top-left, bottom-center, etc)
      this.adjustContainerAlignment(options);
      // Create elements
      var notificationElem = this._createHTMLElement({
        tagName: 'div',
        className: 'notyf__toast'
      });
      var ripple = this._createHTMLElement({
        tagName: 'div',
        className: 'notyf__ripple'
      });
      var wrapper = this._createHTMLElement({
        tagName: 'div',
        className: 'notyf__wrapper'
      });
      var message = this._createHTMLElement({
        tagName: 'div',
        className: 'notyf__message'
      });
      message.innerHTML = options.message || '';
      var mainColor = options.background || options.backgroundColor;
      // Build the icon and append it to the card
      if (iconOpts) {
        var iconContainer = this._createHTMLElement({
          tagName: 'div',
          className: 'notyf__icon'
        });
        if (typeof iconOpts === 'string' || iconOpts instanceof String) iconContainer.innerHTML = new String(iconOpts).valueOf();
        if (typeof iconOpts === 'object') {
          var _a = iconOpts.tagName,
            tagName = _a === void 0 ? 'i' : _a,
            className_1 = iconOpts.className,
            text = iconOpts.text,
            _b = iconOpts.color,
            color = _b === void 0 ? mainColor : _b;
          var iconElement = this._createHTMLElement({
            tagName: tagName,
            className: className_1,
            text: text
          });
          if (color) iconElement.style.color = color;
          iconContainer.appendChild(iconElement);
        }
        wrapper.appendChild(iconContainer);
      }
      wrapper.appendChild(message);
      notificationElem.appendChild(wrapper);
      // Add ripple if applicable, else just paint the full toast
      if (mainColor) {
        if (options.ripple) {
          ripple.style.background = mainColor;
          notificationElem.appendChild(ripple);
        } else {
          notificationElem.style.background = mainColor;
        }
      }
      // Add dismiss button
      if (options.dismissible) {
        var dismissWrapper = this._createHTMLElement({
          tagName: 'div',
          className: 'notyf__dismiss'
        });
        var dismissButton = this._createHTMLElement({
          tagName: 'button',
          className: 'notyf__dismiss-btn'
        });
        dismissWrapper.appendChild(dismissButton);
        wrapper.appendChild(dismissWrapper);
        notificationElem.classList.add("notyf__toast--dismissible");
        dismissButton.addEventListener('click', function (event) {
          var _a, _b;
          (_b = (_a = _this.events)[NotyfEvent.Dismiss]) === null || _b === void 0 ? void 0 : _b.call(_a, {
            target: notification,
            event: event
          });
          event.stopPropagation();
        });
      }
      notificationElem.addEventListener('click', function (event) {
        var _a, _b;
        return (_b = (_a = _this.events)[NotyfEvent.Click]) === null || _b === void 0 ? void 0 : _b.call(_a, {
          target: notification,
          event: event
        });
      });
      // Adjust margins depending on whether its an upper or lower notification
      var className = this.getYPosition(options) === 'top' ? 'upper' : 'lower';
      notificationElem.classList.add("notyf__toast--" + className);
      return notificationElem;
    };
    NotyfView.prototype._createHTMLElement = function (_a) {
      var tagName = _a.tagName,
        className = _a.className,
        text = _a.text;
      var elem = document.createElement(tagName);
      if (className) {
        elem.className = className;
      }
      elem.textContent = text || null;
      return elem;
    };
    /**
     * Creates an invisible container which will announce the notyfs to
     * screen readers
     */
    NotyfView.prototype._createA11yContainer = function () {
      var a11yContainer = this._createHTMLElement({
        tagName: 'div',
        className: 'notyf-announcer'
      });
      a11yContainer.setAttribute('aria-atomic', 'true');
      a11yContainer.setAttribute('aria-live', 'polite');
      // Set the a11y container to be visible hidden. Can't use display: none as
      // screen readers won't read it.
      a11yContainer.style.border = '0';
      a11yContainer.style.clip = 'rect(0 0 0 0)';
      a11yContainer.style.height = '1px';
      a11yContainer.style.margin = '-1px';
      a11yContainer.style.overflow = 'hidden';
      a11yContainer.style.padding = '0';
      a11yContainer.style.position = 'absolute';
      a11yContainer.style.width = '1px';
      a11yContainer.style.outline = '0';
      document.body.appendChild(a11yContainer);
      this.a11yContainer = a11yContainer;
    };
    /**
     * Announces a message to screenreaders.
     */
    NotyfView.prototype._announce = function (message) {
      var _this = this;
      this.a11yContainer.textContent = '';
      // This 100ms timeout is necessary for some browser + screen-reader combinations:
      // - Both JAWS and NVDA over IE11 will not announce anything without a non-zero timeout.
      // - With Chrome and IE11 with NVDA or JAWS, a repeated (identical) message won't be read a
      //   second time without clearing and then using a non-zero delay.
      // (using JAWS 17 at time of this writing).
      // https://github.com/angular/material2/blob/master/src/cdk/a11y/live-announcer/live-announcer.ts
      setTimeout(function () {
        _this.a11yContainer.textContent = message;
      }, 100);
    };
    /**
     * Determine which animationend event is supported
     */
    NotyfView.prototype._getAnimationEndEventName = function () {
      var el = document.createElement('_fake');
      var transitions = {
        MozTransition: 'animationend',
        OTransition: 'oAnimationEnd',
        WebkitTransition: 'webkitAnimationEnd',
        transition: 'animationend'
      };
      var t;
      for (t in transitions) {
        if (el.style[t] !== undefined) {
          return transitions[t];
        }
      }
      // No supported animation end event. Using "animationend" as a fallback
      return 'animationend';
    };
    return NotyfView;
  }();

  /**
   * Main controller class. Defines the main Notyf API.
   */
  var Notyf = /** @class */function () {
    function Notyf(opts) {
      var _this = this;
      this.dismiss = this._removeNotification;
      this.notifications = new NotyfArray();
      this.view = new NotyfView();
      var types = this.registerTypes(opts);
      this.options = __assign(__assign({}, DEFAULT_OPTIONS), opts);
      this.options.types = types;
      this.notifications.onUpdate(function (elem, type) {
        return _this.view.update(elem, type);
      });
      this.view.on(NotyfEvent.Dismiss, function (_a) {
        var target = _a.target,
          event = _a.event;
        _this._removeNotification(target);
        // tslint:disable-next-line: no-string-literal
        target['triggerEvent'](NotyfEvent.Dismiss, event);
      });
      // tslint:disable-next-line: no-string-literal
      this.view.on(NotyfEvent.Click, function (_a) {
        var target = _a.target,
          event = _a.event;
        return target['triggerEvent'](NotyfEvent.Click, event);
      });
    }
    Notyf.prototype.error = function (payload) {
      var options = this.normalizeOptions('error', payload);
      return this.open(options);
    };
    Notyf.prototype.success = function (payload) {
      var options = this.normalizeOptions('success', payload);
      return this.open(options);
    };
    Notyf.prototype.open = function (options) {
      var defaultOpts = this.options.types.find(function (_a) {
        var type = _a.type;
        return type === options.type;
      }) || {};
      var config = __assign(__assign({}, defaultOpts), options);
      this.assignProps(['ripple', 'position', 'dismissible'], config);
      var notification = new NotyfNotification(config);
      this._pushNotification(notification);
      return notification;
    };
    Notyf.prototype.dismissAll = function () {
      while (this.notifications.splice(0, 1));
    };
    /**
     * Assigns properties to a config object based on two rules:
     * 1. If the config object already sets that prop, leave it as so
     * 2. Otherwise, use the default prop from the global options
     *
     * It's intended to build the final config object to open a notification. e.g. if
     * 'dismissible' is not set, then use the value from the global config.
     *
     * @param props - properties to be assigned to the config object
     * @param config - object whose properties need to be set
     */
    Notyf.prototype.assignProps = function (props, config) {
      var _this = this;
      props.forEach(function (prop) {
        // intentional double equality to check for both null and undefined
        config[prop] = config[prop] == null ? _this.options[prop] : config[prop];
      });
    };
    Notyf.prototype._pushNotification = function (notification) {
      var _this = this;
      this.notifications.push(notification);
      var duration = notification.options.duration !== undefined ? notification.options.duration : this.options.duration;
      if (duration) {
        setTimeout(function () {
          return _this._removeNotification(notification);
        }, duration);
      }
    };
    Notyf.prototype._removeNotification = function (notification) {
      var index = this.notifications.indexOf(notification);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    };
    Notyf.prototype.normalizeOptions = function (type, payload) {
      var options = {
        type: type
      };
      if (typeof payload === 'string') {
        options.message = payload;
      } else if (typeof payload === 'object') {
        options = __assign(__assign({}, options), payload);
      }
      return options;
    };
    Notyf.prototype.registerTypes = function (opts) {
      var incomingTypes = (opts && opts.types || []).slice();
      var finalDefaultTypes = DEFAULT_OPTIONS.types.map(function (defaultType) {
        // find if there's a default type within the user input's types, if so, it means the user
        // wants to change some of the default settings
        var userTypeIdx = -1;
        incomingTypes.forEach(function (t, idx) {
          if (t.type === defaultType.type) userTypeIdx = idx;
        });
        var userType = userTypeIdx !== -1 ? incomingTypes.splice(userTypeIdx, 1)[0] : {};
        return __assign(__assign({}, defaultType), userType);
      });
      return finalDefaultTypes.concat(incomingTypes);
    };
    return Notyf;
  }();

  const App = function () {
    const notyf = new Notyf();
    const testFn = async () => {
      const x = await getVacancies();
      console.log(x);
      notyf.error('Please fill out the form');
    };
    testFn();
  };
  App();

})();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInNyYy9zY3JpcHRzL3V0aWxzL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvYXBpL3ZhY2FuY3kvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbm90eWYvbm90eWYuZXMuanMiLCJzcmMvc2NyaXB0cy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3Qgd2FpdCA9IChtcykgPT4ge1xyXG4gIGlmICh0eXBlb2YgbXMgIT09ICdudW1iZXInICYmIG1zIDwgMCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtcyBtdXN0IGJlIG51bWJlciEnKTtcclxuICB9XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcbiIsImltcG9ydCB7d2FpdH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWYWNhbmNpZXMoKSB7XG4gIGF3YWl0IHdhaXQoMTAwMCk7XG4gIHJldHVybiBbXTtcbn1cbiIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcblxyXG52YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfTtcclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59O1xuXG52YXIgTm90eWZOb3RpZmljYXRpb24gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBOb3R5Zk5vdGlmaWNhdGlvbihvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xyXG4gICAgfVxyXG4gICAgTm90eWZOb3RpZmljYXRpb24ucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgY2IpIHtcclxuICAgICAgICB2YXIgY2FsbGJhY2tzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnRUeXBlXSB8fCBbXTtcclxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tldmVudFR5cGVdID0gY2FsbGJhY2tzLmNvbmNhdChbY2JdKTtcclxuICAgIH07XHJcbiAgICBOb3R5Zk5vdGlmaWNhdGlvbi5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgZXZlbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLmxpc3RlbmVyc1tldmVudFR5cGVdIHx8IFtdO1xyXG4gICAgICAgIGNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChjYikgeyByZXR1cm4gY2IoeyB0YXJnZXQ6IF90aGlzLCBldmVudDogZXZlbnQgfSk7IH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBOb3R5Zk5vdGlmaWNhdGlvbjtcclxufSgpKTtcclxudmFyIE5vdHlmQXJyYXlFdmVudDtcclxuKGZ1bmN0aW9uIChOb3R5ZkFycmF5RXZlbnQpIHtcclxuICAgIE5vdHlmQXJyYXlFdmVudFtOb3R5ZkFycmF5RXZlbnRbXCJBZGRcIl0gPSAwXSA9IFwiQWRkXCI7XHJcbiAgICBOb3R5ZkFycmF5RXZlbnRbTm90eWZBcnJheUV2ZW50W1wiUmVtb3ZlXCJdID0gMV0gPSBcIlJlbW92ZVwiO1xyXG59KShOb3R5ZkFycmF5RXZlbnQgfHwgKE5vdHlmQXJyYXlFdmVudCA9IHt9KSk7XHJcbnZhciBOb3R5ZkFycmF5ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTm90eWZBcnJheSgpIHtcclxuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBbXTtcclxuICAgIH1cclxuICAgIE5vdHlmQXJyYXkucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoZWxlbSkge1xyXG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5wdXNoKGVsZW0pO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRm4oZWxlbSwgTm90eWZBcnJheUV2ZW50LkFkZCwgdGhpcy5ub3RpZmljYXRpb25zKTtcclxuICAgIH07XHJcbiAgICBOb3R5ZkFycmF5LnByb3RvdHlwZS5zcGxpY2UgPSBmdW5jdGlvbiAoaW5kZXgsIG51bSkge1xyXG4gICAgICAgIHZhciBlbGVtID0gdGhpcy5ub3RpZmljYXRpb25zLnNwbGljZShpbmRleCwgbnVtKVswXTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUZuKGVsZW0sIE5vdHlmQXJyYXlFdmVudC5SZW1vdmUsIHRoaXMubm90aWZpY2F0aW9ucyk7XHJcbiAgICAgICAgcmV0dXJuIGVsZW07XHJcbiAgICB9O1xyXG4gICAgTm90eWZBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIChlbGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZpY2F0aW9ucy5pbmRleE9mKGVsZW0pO1xyXG4gICAgfTtcclxuICAgIE5vdHlmQXJyYXkucHJvdG90eXBlLm9uVXBkYXRlID0gZnVuY3Rpb24gKGZuKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVGbiA9IGZuO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBOb3R5ZkFycmF5O1xyXG59KCkpO1xuXG52YXIgTm90eWZFdmVudDtcclxuKGZ1bmN0aW9uIChOb3R5ZkV2ZW50KSB7XHJcbiAgICBOb3R5ZkV2ZW50W1wiRGlzbWlzc1wiXSA9IFwiZGlzbWlzc1wiO1xyXG4gICAgTm90eWZFdmVudFtcIkNsaWNrXCJdID0gXCJjbGlja1wiO1xyXG59KShOb3R5ZkV2ZW50IHx8IChOb3R5ZkV2ZW50ID0ge30pKTtcclxudmFyIERFRkFVTFRfT1BUSU9OUyA9IHtcclxuICAgIHR5cGVzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ25vdHlmX190b2FzdC0tc3VjY2VzcycsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMzZGM3NjMnLFxyXG4gICAgICAgICAgICBpY29uOiB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdub3R5Zl9faWNvbi0tc3VjY2VzcycsXHJcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAnaScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ25vdHlmX190b2FzdC0tZXJyb3InLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZWQzZDNkJyxcclxuICAgICAgICAgICAgaWNvbjoge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnbm90eWZfX2ljb24tLWVycm9yJyxcclxuICAgICAgICAgICAgICAgIHRhZ05hbWU6ICdpJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgXSxcclxuICAgIGR1cmF0aW9uOiAyMDAwLFxyXG4gICAgcmlwcGxlOiB0cnVlLFxyXG4gICAgcG9zaXRpb246IHtcclxuICAgICAgICB4OiAncmlnaHQnLFxyXG4gICAgICAgIHk6ICdib3R0b20nLFxyXG4gICAgfSxcclxuICAgIGRpc21pc3NpYmxlOiBmYWxzZSxcclxufTtcblxudmFyIE5vdHlmVmlldyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5vdHlmVmlldygpIHtcclxuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBbXTtcclxuICAgICAgICB0aGlzLmV2ZW50cyA9IHt9O1xyXG4gICAgICAgIHRoaXMuWF9QT1NJVElPTl9GTEVYX01BUCA9IHtcclxuICAgICAgICAgICAgbGVmdDogJ2ZsZXgtc3RhcnQnLFxyXG4gICAgICAgICAgICBjZW50ZXI6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICByaWdodDogJ2ZsZXgtZW5kJyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuWV9QT1NJVElPTl9GTEVYX01BUCA9IHtcclxuICAgICAgICAgICAgdG9wOiAnZmxleC1zdGFydCcsXHJcbiAgICAgICAgICAgIGNlbnRlcjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgIGJvdHRvbTogJ2ZsZXgtZW5kJyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIENyZWF0ZXMgdGhlIG1haW4gbm90aWZpY2F0aW9ucyBjb250YWluZXJcclxuICAgICAgICB2YXIgZG9jRnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgICAgICB2YXIgbm90eWZDb250YWluZXIgPSB0aGlzLl9jcmVhdGVIVE1MRWxlbWVudCh7IHRhZ05hbWU6ICdkaXYnLCBjbGFzc05hbWU6ICdub3R5ZicgfSk7XHJcbiAgICAgICAgZG9jRnJhZy5hcHBlbmRDaGlsZChub3R5ZkNvbnRhaW5lcik7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb2NGcmFnKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IG5vdHlmQ29udGFpbmVyO1xyXG4gICAgICAgIC8vIElkZW50aWZpZXMgdGhlIG1haW4gYW5pbWF0aW9uIGVuZCBldmVudFxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uRW5kRXZlbnROYW1lID0gdGhpcy5fZ2V0QW5pbWF0aW9uRW5kRXZlbnROYW1lKCk7XHJcbiAgICAgICAgdGhpcy5fY3JlYXRlQTExeUNvbnRhaW5lcigpO1xyXG4gICAgfVxyXG4gICAgTm90eWZWaWV3LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgY2IpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdGhpcy5ldmVudHMpLCAoX2EgPSB7fSwgX2FbZXZlbnRdID0gY2IsIF9hKSk7XHJcbiAgICB9O1xyXG4gICAgTm90eWZWaWV3LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAobm90aWZpY2F0aW9uLCB0eXBlKSB7XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IE5vdHlmQXJyYXlFdmVudC5BZGQpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGROb3RpZmljYXRpb24obm90aWZpY2F0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gTm90eWZBcnJheUV2ZW50LlJlbW92ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGlmaWNhdGlvbihub3RpZmljYXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOb3R5ZlZpZXcucHJvdG90eXBlLnJlbW92ZU5vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uIChub3RpZmljYXRpb24pIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciByZW5kZXJlZE5vdGlmaWNhdGlvbiA9IHRoaXMuX3BvcFJlbmRlcmVkTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbik7XHJcbiAgICAgICAgdmFyIG5vZGU7XHJcbiAgICAgICAgaWYgKCFyZW5kZXJlZE5vdGlmaWNhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGUgPSByZW5kZXJlZE5vdGlmaWNhdGlvbi5ub2RlO1xyXG4gICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZCgnbm90eWZfX3RvYXN0LS1kaXNhcHBlYXInKTtcclxuICAgICAgICB2YXIgaGFuZGxlRXZlbnQ7XHJcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKHRoaXMuYW5pbWF0aW9uRW5kRXZlbnROYW1lLCAoaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKF90aGlzLmFuaW1hdGlvbkVuZEV2ZW50TmFtZSwgaGFuZGxlRXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuY29udGFpbmVyLnJlbW92ZUNoaWxkKG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkpO1xyXG4gICAgfTtcclxuICAgIE5vdHlmVmlldy5wcm90b3R5cGUuYWRkTm90aWZpY2F0aW9uID0gZnVuY3Rpb24gKG5vdGlmaWNhdGlvbikge1xyXG4gICAgICAgIHZhciBub2RlID0gdGhpcy5fcmVuZGVyTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbik7XHJcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnB1c2goeyBub3RpZmljYXRpb246IG5vdGlmaWNhdGlvbiwgbm9kZTogbm9kZSB9KTtcclxuICAgICAgICAvLyBGb3IgYTExeSBwdXJwb3Nlcywgd2Ugc3RpbGwgd2FudCB0byBhbm5vdW5jZSB0aGF0IHRoZXJlJ3MgYSBub3RpZmljYXRpb24gaW4gdGhlIHNjcmVlblxyXG4gICAgICAgIC8vIGV2ZW4gaWYgaXQgY29tZXMgd2l0aCBubyBtZXNzYWdlLlxyXG4gICAgICAgIHRoaXMuX2Fubm91bmNlKG5vdGlmaWNhdGlvbi5vcHRpb25zLm1lc3NhZ2UgfHwgJ05vdGlmaWNhdGlvbicpO1xyXG4gICAgfTtcclxuICAgIE5vdHlmVmlldy5wcm90b3R5cGUuX3JlbmRlck5vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uIChub3RpZmljYXRpb24pIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgdmFyIGNhcmQgPSB0aGlzLl9idWlsZE5vdGlmaWNhdGlvbkNhcmQobm90aWZpY2F0aW9uKTtcclxuICAgICAgICB2YXIgY2xhc3NOYW1lID0gbm90aWZpY2F0aW9uLm9wdGlvbnMuY2xhc3NOYW1lO1xyXG4gICAgICAgIGlmIChjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgKF9hID0gY2FyZC5jbGFzc0xpc3QpLmFkZC5hcHBseShfYSwgY2xhc3NOYW1lLnNwbGl0KCcgJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXJkKTtcclxuICAgICAgICByZXR1cm4gY2FyZDtcclxuICAgIH07XHJcbiAgICBOb3R5ZlZpZXcucHJvdG90eXBlLl9wb3BSZW5kZXJlZE5vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uIChub3RpZmljYXRpb24pIHtcclxuICAgICAgICB2YXIgaWR4ID0gLTE7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5vdGlmaWNhdGlvbnMubGVuZ3RoICYmIGlkeCA8IDA7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ub3RpZmljYXRpb25zW2ldLm5vdGlmaWNhdGlvbiA9PT0gbm90aWZpY2F0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZHggPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpZHggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5vdGlmaWNhdGlvbnMuc3BsaWNlKGlkeCwgMSlbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH07XHJcbiAgICBOb3R5ZlZpZXcucHJvdG90eXBlLmdldFhQb3NpdGlvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIHJldHVybiAoKF9hID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLnBvc2l0aW9uKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EueCkgfHwgJ3JpZ2h0JztcclxuICAgIH07XHJcbiAgICBOb3R5ZlZpZXcucHJvdG90eXBlLmdldFlQb3NpdGlvbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIHJldHVybiAoKF9hID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLnBvc2l0aW9uKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EueSkgfHwgJ2JvdHRvbSc7XHJcbiAgICB9O1xyXG4gICAgTm90eWZWaWV3LnByb3RvdHlwZS5hZGp1c3RDb250YWluZXJBbGlnbm1lbnQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBhbGlnbiA9IHRoaXMuWF9QT1NJVElPTl9GTEVYX01BUFt0aGlzLmdldFhQb3NpdGlvbihvcHRpb25zKV07XHJcbiAgICAgICAgdmFyIGp1c3RpZnkgPSB0aGlzLllfUE9TSVRJT05fRkxFWF9NQVBbdGhpcy5nZXRZUG9zaXRpb24ob3B0aW9ucyldO1xyXG4gICAgICAgIHZhciBzdHlsZSA9IHRoaXMuY29udGFpbmVyLnN0eWxlO1xyXG4gICAgICAgIHN0eWxlLnNldFByb3BlcnR5KCdqdXN0aWZ5LWNvbnRlbnQnLCBqdXN0aWZ5KTtcclxuICAgICAgICBzdHlsZS5zZXRQcm9wZXJ0eSgnYWxpZ24taXRlbXMnLCBhbGlnbik7XHJcbiAgICB9O1xyXG4gICAgTm90eWZWaWV3LnByb3RvdHlwZS5fYnVpbGROb3RpZmljYXRpb25DYXJkID0gZnVuY3Rpb24gKG5vdGlmaWNhdGlvbikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBub3RpZmljYXRpb24ub3B0aW9ucztcclxuICAgICAgICB2YXIgaWNvbk9wdHMgPSBvcHRpb25zLmljb247XHJcbiAgICAgICAgLy8gQWRqdXN0IGNvbnRhaW5lciBhY2NvcmRpbmcgdG8gcG9zaXRpb24gKGUuZy4gdG9wLWxlZnQsIGJvdHRvbS1jZW50ZXIsIGV0YylcclxuICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lckFsaWdubWVudChvcHRpb25zKTtcclxuICAgICAgICAvLyBDcmVhdGUgZWxlbWVudHNcclxuICAgICAgICB2YXIgbm90aWZpY2F0aW9uRWxlbSA9IHRoaXMuX2NyZWF0ZUhUTUxFbGVtZW50KHsgdGFnTmFtZTogJ2RpdicsIGNsYXNzTmFtZTogJ25vdHlmX190b2FzdCcgfSk7XHJcbiAgICAgICAgdmFyIHJpcHBsZSA9IHRoaXMuX2NyZWF0ZUhUTUxFbGVtZW50KHsgdGFnTmFtZTogJ2RpdicsIGNsYXNzTmFtZTogJ25vdHlmX19yaXBwbGUnIH0pO1xyXG4gICAgICAgIHZhciB3cmFwcGVyID0gdGhpcy5fY3JlYXRlSFRNTEVsZW1lbnQoeyB0YWdOYW1lOiAnZGl2JywgY2xhc3NOYW1lOiAnbm90eWZfX3dyYXBwZXInIH0pO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlSFRNTEVsZW1lbnQoeyB0YWdOYW1lOiAnZGl2JywgY2xhc3NOYW1lOiAnbm90eWZfX21lc3NhZ2UnIH0pO1xyXG4gICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gb3B0aW9ucy5tZXNzYWdlIHx8ICcnO1xyXG4gICAgICAgIHZhciBtYWluQ29sb3IgPSBvcHRpb25zLmJhY2tncm91bmQgfHwgb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgLy8gQnVpbGQgdGhlIGljb24gYW5kIGFwcGVuZCBpdCB0byB0aGUgY2FyZFxyXG4gICAgICAgIGlmIChpY29uT3B0cykge1xyXG4gICAgICAgICAgICB2YXIgaWNvbkNvbnRhaW5lciA9IHRoaXMuX2NyZWF0ZUhUTUxFbGVtZW50KHsgdGFnTmFtZTogJ2RpdicsIGNsYXNzTmFtZTogJ25vdHlmX19pY29uJyB9KTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpY29uT3B0cyA9PT0gJ3N0cmluZycgfHwgaWNvbk9wdHMgaW5zdGFuY2VvZiBTdHJpbmcpXHJcbiAgICAgICAgICAgICAgICBpY29uQ29udGFpbmVyLmlubmVySFRNTCA9IG5ldyBTdHJpbmcoaWNvbk9wdHMpLnZhbHVlT2YoKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpY29uT3B0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBfYSA9IGljb25PcHRzLnRhZ05hbWUsIHRhZ05hbWUgPSBfYSA9PT0gdm9pZCAwID8gJ2knIDogX2EsIGNsYXNzTmFtZV8xID0gaWNvbk9wdHMuY2xhc3NOYW1lLCB0ZXh0ID0gaWNvbk9wdHMudGV4dCwgX2IgPSBpY29uT3B0cy5jb2xvciwgY29sb3IgPSBfYiA9PT0gdm9pZCAwID8gbWFpbkNvbG9yIDogX2I7XHJcbiAgICAgICAgICAgICAgICB2YXIgaWNvbkVsZW1lbnQgPSB0aGlzLl9jcmVhdGVIVE1MRWxlbWVudCh7IHRhZ05hbWU6IHRhZ05hbWUsIGNsYXNzTmFtZTogY2xhc3NOYW1lXzEsIHRleHQ6IHRleHQgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sb3IpXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbkVsZW1lbnQuc3R5bGUuY29sb3IgPSBjb2xvcjtcclxuICAgICAgICAgICAgICAgIGljb25Db250YWluZXIuYXBwZW5kQ2hpbGQoaWNvbkVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoaWNvbkNvbnRhaW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uRWxlbS5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcclxuICAgICAgICAvLyBBZGQgcmlwcGxlIGlmIGFwcGxpY2FibGUsIGVsc2UganVzdCBwYWludCB0aGUgZnVsbCB0b2FzdFxyXG4gICAgICAgIGlmIChtYWluQ29sb3IpIHtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMucmlwcGxlKSB7XHJcbiAgICAgICAgICAgICAgICByaXBwbGUuc3R5bGUuYmFja2dyb3VuZCA9IG1haW5Db2xvcjtcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkVsZW0uYXBwZW5kQ2hpbGQocmlwcGxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkVsZW0uc3R5bGUuYmFja2dyb3VuZCA9IG1haW5Db2xvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBZGQgZGlzbWlzcyBidXR0b25cclxuICAgICAgICBpZiAob3B0aW9ucy5kaXNtaXNzaWJsZSkge1xyXG4gICAgICAgICAgICB2YXIgZGlzbWlzc1dyYXBwZXIgPSB0aGlzLl9jcmVhdGVIVE1MRWxlbWVudCh7IHRhZ05hbWU6ICdkaXYnLCBjbGFzc05hbWU6ICdub3R5Zl9fZGlzbWlzcycgfSk7XHJcbiAgICAgICAgICAgIHZhciBkaXNtaXNzQnV0dG9uID0gdGhpcy5fY3JlYXRlSFRNTEVsZW1lbnQoe1xyXG4gICAgICAgICAgICAgICAgdGFnTmFtZTogJ2J1dHRvbicsXHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdub3R5Zl9fZGlzbWlzcy1idG4nLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZGlzbWlzc1dyYXBwZXIuYXBwZW5kQ2hpbGQoZGlzbWlzc0J1dHRvbik7XHJcbiAgICAgICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoZGlzbWlzc1dyYXBwZXIpO1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb25FbGVtLmNsYXNzTGlzdC5hZGQoXCJub3R5Zl9fdG9hc3QtLWRpc21pc3NpYmxlXCIpO1xyXG4gICAgICAgICAgICBkaXNtaXNzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgX2EsIF9iO1xyXG4gICAgICAgICAgICAgICAgKF9iID0gKF9hID0gX3RoaXMuZXZlbnRzKVtOb3R5ZkV2ZW50LkRpc21pc3NdKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbChfYSwgeyB0YXJnZXQ6IG5vdGlmaWNhdGlvbiwgZXZlbnQ6IGV2ZW50IH0pO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub3RpZmljYXRpb25FbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7IHZhciBfYSwgX2I7IHJldHVybiAoX2IgPSAoX2EgPSBfdGhpcy5ldmVudHMpW05vdHlmRXZlbnQuQ2xpY2tdKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbChfYSwgeyB0YXJnZXQ6IG5vdGlmaWNhdGlvbiwgZXZlbnQ6IGV2ZW50IH0pOyB9KTtcclxuICAgICAgICAvLyBBZGp1c3QgbWFyZ2lucyBkZXBlbmRpbmcgb24gd2hldGhlciBpdHMgYW4gdXBwZXIgb3IgbG93ZXIgbm90aWZpY2F0aW9uXHJcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IHRoaXMuZ2V0WVBvc2l0aW9uKG9wdGlvbnMpID09PSAndG9wJyA/ICd1cHBlcicgOiAnbG93ZXInO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbkVsZW0uY2xhc3NMaXN0LmFkZChcIm5vdHlmX190b2FzdC0tXCIgKyBjbGFzc05hbWUpO1xyXG4gICAgICAgIHJldHVybiBub3RpZmljYXRpb25FbGVtO1xyXG4gICAgfTtcclxuICAgIE5vdHlmVmlldy5wcm90b3R5cGUuX2NyZWF0ZUhUTUxFbGVtZW50ID0gZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgdmFyIHRhZ05hbWUgPSBfYS50YWdOYW1lLCBjbGFzc05hbWUgPSBfYS5jbGFzc05hbWUsIHRleHQgPSBfYS50ZXh0O1xyXG4gICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcclxuICAgICAgICBpZiAoY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICAgIGVsZW0uY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtLnRleHRDb250ZW50ID0gdGV4dCB8fCBudWxsO1xyXG4gICAgICAgIHJldHVybiBlbGVtO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBpbnZpc2libGUgY29udGFpbmVyIHdoaWNoIHdpbGwgYW5ub3VuY2UgdGhlIG5vdHlmcyB0b1xyXG4gICAgICogc2NyZWVuIHJlYWRlcnNcclxuICAgICAqL1xyXG4gICAgTm90eWZWaWV3LnByb3RvdHlwZS5fY3JlYXRlQTExeUNvbnRhaW5lciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgYTExeUNvbnRhaW5lciA9IHRoaXMuX2NyZWF0ZUhUTUxFbGVtZW50KHsgdGFnTmFtZTogJ2RpdicsIGNsYXNzTmFtZTogJ25vdHlmLWFubm91bmNlcicgfSk7XHJcbiAgICAgICAgYTExeUNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ2FyaWEtYXRvbWljJywgJ3RydWUnKTtcclxuICAgICAgICBhMTF5Q29udGFpbmVyLnNldEF0dHJpYnV0ZSgnYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xyXG4gICAgICAgIC8vIFNldCB0aGUgYTExeSBjb250YWluZXIgdG8gYmUgdmlzaWJsZSBoaWRkZW4uIENhbid0IHVzZSBkaXNwbGF5OiBub25lIGFzXHJcbiAgICAgICAgLy8gc2NyZWVuIHJlYWRlcnMgd29uJ3QgcmVhZCBpdC5cclxuICAgICAgICBhMTF5Q29udGFpbmVyLnN0eWxlLmJvcmRlciA9ICcwJztcclxuICAgICAgICBhMTF5Q29udGFpbmVyLnN0eWxlLmNsaXAgPSAncmVjdCgwIDAgMCAwKSc7XHJcbiAgICAgICAgYTExeUNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAnMXB4JztcclxuICAgICAgICBhMTF5Q29udGFpbmVyLnN0eWxlLm1hcmdpbiA9ICctMXB4JztcclxuICAgICAgICBhMTF5Q29udGFpbmVyLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgYTExeUNvbnRhaW5lci5zdHlsZS5wYWRkaW5nID0gJzAnO1xyXG4gICAgICAgIGExMXlDb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgIGExMXlDb250YWluZXIuc3R5bGUud2lkdGggPSAnMXB4JztcclxuICAgICAgICBhMTF5Q29udGFpbmVyLnN0eWxlLm91dGxpbmUgPSAnMCc7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhMTF5Q29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLmExMXlDb250YWluZXIgPSBhMTF5Q29udGFpbmVyO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQW5ub3VuY2VzIGEgbWVzc2FnZSB0byBzY3JlZW5yZWFkZXJzLlxyXG4gICAgICovXHJcbiAgICBOb3R5ZlZpZXcucHJvdG90eXBlLl9hbm5vdW5jZSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLmExMXlDb250YWluZXIudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAvLyBUaGlzIDEwMG1zIHRpbWVvdXQgaXMgbmVjZXNzYXJ5IGZvciBzb21lIGJyb3dzZXIgKyBzY3JlZW4tcmVhZGVyIGNvbWJpbmF0aW9uczpcclxuICAgICAgICAvLyAtIEJvdGggSkFXUyBhbmQgTlZEQSBvdmVyIElFMTEgd2lsbCBub3QgYW5ub3VuY2UgYW55dGhpbmcgd2l0aG91dCBhIG5vbi16ZXJvIHRpbWVvdXQuXHJcbiAgICAgICAgLy8gLSBXaXRoIENocm9tZSBhbmQgSUUxMSB3aXRoIE5WREEgb3IgSkFXUywgYSByZXBlYXRlZCAoaWRlbnRpY2FsKSBtZXNzYWdlIHdvbid0IGJlIHJlYWQgYVxyXG4gICAgICAgIC8vICAgc2Vjb25kIHRpbWUgd2l0aG91dCBjbGVhcmluZyBhbmQgdGhlbiB1c2luZyBhIG5vbi16ZXJvIGRlbGF5LlxyXG4gICAgICAgIC8vICh1c2luZyBKQVdTIDE3IGF0IHRpbWUgb2YgdGhpcyB3cml0aW5nKS5cclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9tYXRlcmlhbDIvYmxvYi9tYXN0ZXIvc3JjL2Nkay9hMTF5L2xpdmUtYW5ub3VuY2VyL2xpdmUtYW5ub3VuY2VyLnRzXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIF90aGlzLmExMXlDb250YWluZXIudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgICAgIH0sIDEwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmUgd2hpY2ggYW5pbWF0aW9uZW5kIGV2ZW50IGlzIHN1cHBvcnRlZFxyXG4gICAgICovXHJcbiAgICBOb3R5ZlZpZXcucHJvdG90eXBlLl9nZXRBbmltYXRpb25FbmRFdmVudE5hbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnX2Zha2UnKTtcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIE1velRyYW5zaXRpb246ICdhbmltYXRpb25lbmQnLFxyXG4gICAgICAgICAgICBPVHJhbnNpdGlvbjogJ29BbmltYXRpb25FbmQnLFxyXG4gICAgICAgICAgICBXZWJraXRUcmFuc2l0aW9uOiAnd2Via2l0QW5pbWF0aW9uRW5kJyxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2FuaW1hdGlvbmVuZCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgdDtcclxuICAgICAgICBmb3IgKHQgaW4gdHJhbnNpdGlvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGVsLnN0eWxlW3RdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2l0aW9uc1t0XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBObyBzdXBwb3J0ZWQgYW5pbWF0aW9uIGVuZCBldmVudC4gVXNpbmcgXCJhbmltYXRpb25lbmRcIiBhcyBhIGZhbGxiYWNrXHJcbiAgICAgICAgcmV0dXJuICdhbmltYXRpb25lbmQnO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBOb3R5ZlZpZXc7XHJcbn0oKSk7XG5cbi8qKlxyXG4gKiBNYWluIGNvbnRyb2xsZXIgY2xhc3MuIERlZmluZXMgdGhlIG1haW4gTm90eWYgQVBJLlxyXG4gKi9cclxudmFyIE5vdHlmID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTm90eWYob3B0cykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5kaXNtaXNzID0gdGhpcy5fcmVtb3ZlTm90aWZpY2F0aW9uO1xyXG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucyA9IG5ldyBOb3R5ZkFycmF5KCk7XHJcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IE5vdHlmVmlldygpO1xyXG4gICAgICAgIHZhciB0eXBlcyA9IHRoaXMucmVnaXN0ZXJUeXBlcyhvcHRzKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TKSwgb3B0cyk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnR5cGVzID0gdHlwZXM7XHJcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLm9uVXBkYXRlKGZ1bmN0aW9uIChlbGVtLCB0eXBlKSB7IHJldHVybiBfdGhpcy52aWV3LnVwZGF0ZShlbGVtLCB0eXBlKTsgfSk7XHJcbiAgICAgICAgdGhpcy52aWV3Lm9uKE5vdHlmRXZlbnQuRGlzbWlzcywgZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBfYS50YXJnZXQsIGV2ZW50ID0gX2EuZXZlbnQ7XHJcbiAgICAgICAgICAgIF90aGlzLl9yZW1vdmVOb3RpZmljYXRpb24odGFyZ2V0KTtcclxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1zdHJpbmctbGl0ZXJhbFxyXG4gICAgICAgICAgICB0YXJnZXRbJ3RyaWdnZXJFdmVudCddKE5vdHlmRXZlbnQuRGlzbWlzcywgZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tc3RyaW5nLWxpdGVyYWxcclxuICAgICAgICB0aGlzLnZpZXcub24oTm90eWZFdmVudC5DbGljaywgZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBfYS50YXJnZXQsIGV2ZW50ID0gX2EuZXZlbnQ7XHJcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbJ3RyaWdnZXJFdmVudCddKE5vdHlmRXZlbnQuQ2xpY2ssIGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIE5vdHlmLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIChwYXlsb2FkKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm5vcm1hbGl6ZU9wdGlvbnMoJ2Vycm9yJywgcGF5bG9hZCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3BlbihvcHRpb25zKTtcclxuICAgIH07XHJcbiAgICBOb3R5Zi5wcm90b3R5cGUuc3VjY2VzcyA9IGZ1bmN0aW9uIChwYXlsb2FkKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm5vcm1hbGl6ZU9wdGlvbnMoJ3N1Y2Nlc3MnLCBwYXlsb2FkKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcGVuKG9wdGlvbnMpO1xyXG4gICAgfTtcclxuICAgIE5vdHlmLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgZGVmYXVsdE9wdHMgPSB0aGlzLm9wdGlvbnMudHlwZXMuZmluZChmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgdmFyIHR5cGUgPSBfYS50eXBlO1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZSA9PT0gb3B0aW9ucy50eXBlO1xyXG4gICAgICAgIH0pIHx8IHt9O1xyXG4gICAgICAgIHZhciBjb25maWcgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgZGVmYXVsdE9wdHMpLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLmFzc2lnblByb3BzKFsncmlwcGxlJywgJ3Bvc2l0aW9uJywgJ2Rpc21pc3NpYmxlJ10sIGNvbmZpZyk7XHJcbiAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IG5ldyBOb3R5Zk5vdGlmaWNhdGlvbihjb25maWcpO1xyXG4gICAgICAgIHRoaXMuX3B1c2hOb3RpZmljYXRpb24obm90aWZpY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gbm90aWZpY2F0aW9uO1xyXG4gICAgfTtcclxuICAgIE5vdHlmLnByb3RvdHlwZS5kaXNtaXNzQWxsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHdoaWxlICh0aGlzLm5vdGlmaWNhdGlvbnMuc3BsaWNlKDAsIDEpKVxyXG4gICAgICAgICAgICA7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBc3NpZ25zIHByb3BlcnRpZXMgdG8gYSBjb25maWcgb2JqZWN0IGJhc2VkIG9uIHR3byBydWxlczpcclxuICAgICAqIDEuIElmIHRoZSBjb25maWcgb2JqZWN0IGFscmVhZHkgc2V0cyB0aGF0IHByb3AsIGxlYXZlIGl0IGFzIHNvXHJcbiAgICAgKiAyLiBPdGhlcndpc2UsIHVzZSB0aGUgZGVmYXVsdCBwcm9wIGZyb20gdGhlIGdsb2JhbCBvcHRpb25zXHJcbiAgICAgKlxyXG4gICAgICogSXQncyBpbnRlbmRlZCB0byBidWlsZCB0aGUgZmluYWwgY29uZmlnIG9iamVjdCB0byBvcGVuIGEgbm90aWZpY2F0aW9uLiBlLmcuIGlmXHJcbiAgICAgKiAnZGlzbWlzc2libGUnIGlzIG5vdCBzZXQsIHRoZW4gdXNlIHRoZSB2YWx1ZSBmcm9tIHRoZSBnbG9iYWwgY29uZmlnLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBwcm9wcyAtIHByb3BlcnRpZXMgdG8gYmUgYXNzaWduZWQgdG8gdGhlIGNvbmZpZyBvYmplY3RcclxuICAgICAqIEBwYXJhbSBjb25maWcgLSBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBuZWVkIHRvIGJlIHNldFxyXG4gICAgICovXHJcbiAgICBOb3R5Zi5wcm90b3R5cGUuYXNzaWduUHJvcHMgPSBmdW5jdGlvbiAocHJvcHMsIGNvbmZpZykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcHJvcHMuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xyXG4gICAgICAgICAgICAvLyBpbnRlbnRpb25hbCBkb3VibGUgZXF1YWxpdHkgdG8gY2hlY2sgZm9yIGJvdGggbnVsbCBhbmQgdW5kZWZpbmVkXHJcbiAgICAgICAgICAgIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ1twcm9wXSA9PSBudWxsID8gX3RoaXMub3B0aW9uc1twcm9wXSA6IGNvbmZpZ1twcm9wXTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBOb3R5Zi5wcm90b3R5cGUuX3B1c2hOb3RpZmljYXRpb24gPSBmdW5jdGlvbiAobm90aWZpY2F0aW9uKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMucHVzaChub3RpZmljYXRpb24pO1xyXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IG5vdGlmaWNhdGlvbi5vcHRpb25zLmR1cmF0aW9uICE9PSB1bmRlZmluZWQgPyBub3RpZmljYXRpb24ub3B0aW9ucy5kdXJhdGlvbiA6IHRoaXMub3B0aW9ucy5kdXJhdGlvbjtcclxuICAgICAgICBpZiAoZHVyYXRpb24pIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy5fcmVtb3ZlTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbik7IH0sIGR1cmF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTm90eWYucHJvdG90eXBlLl9yZW1vdmVOb3RpZmljYXRpb24gPSBmdW5jdGlvbiAobm90aWZpY2F0aW9uKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5ub3RpZmljYXRpb25zLmluZGV4T2Yobm90aWZpY2F0aW9uKTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBOb3R5Zi5wcm90b3R5cGUubm9ybWFsaXplT3B0aW9ucyA9IGZ1bmN0aW9uICh0eXBlLCBwYXlsb2FkKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7IHR5cGU6IHR5cGUgfTtcclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMubWVzc2FnZSA9IHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gX19hc3NpZ24oX19hc3NpZ24oe30sIG9wdGlvbnMpLCBwYXlsb2FkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XHJcbiAgICB9O1xyXG4gICAgTm90eWYucHJvdG90eXBlLnJlZ2lzdGVyVHlwZXMgPSBmdW5jdGlvbiAob3B0cykge1xyXG4gICAgICAgIHZhciBpbmNvbWluZ1R5cGVzID0gKChvcHRzICYmIG9wdHMudHlwZXMpIHx8IFtdKS5zbGljZSgpO1xyXG4gICAgICAgIHZhciBmaW5hbERlZmF1bHRUeXBlcyA9IERFRkFVTFRfT1BUSU9OUy50eXBlcy5tYXAoZnVuY3Rpb24gKGRlZmF1bHRUeXBlKSB7XHJcbiAgICAgICAgICAgIC8vIGZpbmQgaWYgdGhlcmUncyBhIGRlZmF1bHQgdHlwZSB3aXRoaW4gdGhlIHVzZXIgaW5wdXQncyB0eXBlcywgaWYgc28sIGl0IG1lYW5zIHRoZSB1c2VyXHJcbiAgICAgICAgICAgIC8vIHdhbnRzIHRvIGNoYW5nZSBzb21lIG9mIHRoZSBkZWZhdWx0IHNldHRpbmdzXHJcbiAgICAgICAgICAgIHZhciB1c2VyVHlwZUlkeCA9IC0xO1xyXG4gICAgICAgICAgICBpbmNvbWluZ1R5cGVzLmZvckVhY2goZnVuY3Rpb24gKHQsIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gZGVmYXVsdFR5cGUudHlwZSlcclxuICAgICAgICAgICAgICAgICAgICB1c2VyVHlwZUlkeCA9IGlkeDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciB1c2VyVHlwZSA9IHVzZXJUeXBlSWR4ICE9PSAtMSA/IGluY29taW5nVHlwZXMuc3BsaWNlKHVzZXJUeXBlSWR4LCAxKVswXSA6IHt9O1xyXG4gICAgICAgICAgICByZXR1cm4gX19hc3NpZ24oX19hc3NpZ24oe30sIGRlZmF1bHRUeXBlKSwgdXNlclR5cGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmaW5hbERlZmF1bHRUeXBlcy5jb25jYXQoaW5jb21pbmdUeXBlcyk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIE5vdHlmO1xyXG59KCkpO1xuXG5leHBvcnQgeyBERUZBVUxUX09QVElPTlMsIE5vdHlmLCBOb3R5ZkFycmF5LCBOb3R5ZkFycmF5RXZlbnQsIE5vdHlmRXZlbnQsIE5vdHlmTm90aWZpY2F0aW9uLCBOb3R5ZlZpZXcgfTtcbiIsImltcG9ydCB7Z2V0VmFjYW5jaWVzfSBmcm9tIFwiLi9hcGkvdmFjYW5jeVwiO1xuaW1wb3J0IHsgTm90eWYgfSBmcm9tICdub3R5Zic7XG5cbmNvbnN0IEFwcCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgbm90eWYgPSBuZXcgTm90eWYoKTtcblxuICBjb25zdCB0ZXN0Rm4gPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeCA9IGF3YWl0IGdldFZhY2FuY2llcygpO1xuICAgIGNvbnNvbGUubG9nKHgpO1xuXG4gICAgbm90eWYuZXJyb3IoJ1BsZWFzZSBmaWxsIG91dCB0aGUgZm9ybScpO1xuICB9XG5cbiAgdGVzdEZuKCk7XG59XG5cbkFwcCgpO1xuIl0sIm5hbWVzIjpbIndhaXQiLCJtcyIsIkVycm9yIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRUaW1lb3V0IiwiZ2V0VmFjYW5jaWVzIiwiX19hc3NpZ24iLCJPYmplY3QiLCJhc3NpZ24iLCJ0IiwicyIsImkiLCJuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwicCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImFwcGx5IiwiTm90eWZOb3RpZmljYXRpb24iLCJvcHRpb25zIiwibGlzdGVuZXJzIiwib24iLCJldmVudFR5cGUiLCJjYiIsImNhbGxiYWNrcyIsImNvbmNhdCIsInRyaWdnZXJFdmVudCIsImV2ZW50IiwiX3RoaXMiLCJmb3JFYWNoIiwidGFyZ2V0IiwiTm90eWZBcnJheUV2ZW50IiwiTm90eWZBcnJheSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoIiwiZWxlbSIsInVwZGF0ZUZuIiwiQWRkIiwic3BsaWNlIiwiaW5kZXgiLCJudW0iLCJSZW1vdmUiLCJpbmRleE9mIiwib25VcGRhdGUiLCJmbiIsIk5vdHlmRXZlbnQiLCJERUZBVUxUX09QVElPTlMiLCJ0eXBlcyIsInR5cGUiLCJjbGFzc05hbWUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJpY29uIiwidGFnTmFtZSIsImR1cmF0aW9uIiwicmlwcGxlIiwicG9zaXRpb24iLCJ4IiwieSIsImRpc21pc3NpYmxlIiwiTm90eWZWaWV3IiwiZXZlbnRzIiwiWF9QT1NJVElPTl9GTEVYX01BUCIsImxlZnQiLCJjZW50ZXIiLCJyaWdodCIsIllfUE9TSVRJT05fRkxFWF9NQVAiLCJ0b3AiLCJib3R0b20iLCJkb2NGcmFnIiwiZG9jdW1lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50Iiwibm90eWZDb250YWluZXIiLCJfY3JlYXRlSFRNTEVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsImJvZHkiLCJjb250YWluZXIiLCJhbmltYXRpb25FbmRFdmVudE5hbWUiLCJfZ2V0QW5pbWF0aW9uRW5kRXZlbnROYW1lIiwiX2NyZWF0ZUExMXlDb250YWluZXIiLCJfYSIsInVwZGF0ZSIsIm5vdGlmaWNhdGlvbiIsImFkZE5vdGlmaWNhdGlvbiIsInJlbW92ZU5vdGlmaWNhdGlvbiIsInJlbmRlcmVkTm90aWZpY2F0aW9uIiwiX3BvcFJlbmRlcmVkTm90aWZpY2F0aW9uIiwibm9kZSIsImNsYXNzTGlzdCIsImFkZCIsImhhbmRsZUV2ZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmVDaGlsZCIsIl9yZW5kZXJOb3RpZmljYXRpb24iLCJfYW5ub3VuY2UiLCJtZXNzYWdlIiwiY2FyZCIsIl9idWlsZE5vdGlmaWNhdGlvbkNhcmQiLCJzcGxpdCIsImlkeCIsImdldFhQb3NpdGlvbiIsImdldFlQb3NpdGlvbiIsImFkanVzdENvbnRhaW5lckFsaWdubWVudCIsImFsaWduIiwianVzdGlmeSIsInN0eWxlIiwic2V0UHJvcGVydHkiLCJpY29uT3B0cyIsIm5vdGlmaWNhdGlvbkVsZW0iLCJ3cmFwcGVyIiwiaW5uZXJIVE1MIiwibWFpbkNvbG9yIiwiYmFja2dyb3VuZCIsImljb25Db250YWluZXIiLCJTdHJpbmciLCJ2YWx1ZU9mIiwiY2xhc3NOYW1lXzEiLCJ0ZXh0IiwiX2IiLCJjb2xvciIsImljb25FbGVtZW50IiwiZGlzbWlzc1dyYXBwZXIiLCJkaXNtaXNzQnV0dG9uIiwiRGlzbWlzcyIsInN0b3BQcm9wYWdhdGlvbiIsIkNsaWNrIiwiY3JlYXRlRWxlbWVudCIsInRleHRDb250ZW50IiwiYTExeUNvbnRhaW5lciIsInNldEF0dHJpYnV0ZSIsImJvcmRlciIsImNsaXAiLCJoZWlnaHQiLCJtYXJnaW4iLCJvdmVyZmxvdyIsInBhZGRpbmciLCJ3aWR0aCIsIm91dGxpbmUiLCJlbCIsInRyYW5zaXRpb25zIiwiTW96VHJhbnNpdGlvbiIsIk9UcmFuc2l0aW9uIiwiV2Via2l0VHJhbnNpdGlvbiIsInRyYW5zaXRpb24iLCJ1bmRlZmluZWQiLCJOb3R5ZiIsIm9wdHMiLCJkaXNtaXNzIiwiX3JlbW92ZU5vdGlmaWNhdGlvbiIsInZpZXciLCJyZWdpc3RlclR5cGVzIiwiZXJyb3IiLCJwYXlsb2FkIiwibm9ybWFsaXplT3B0aW9ucyIsIm9wZW4iLCJzdWNjZXNzIiwiZGVmYXVsdE9wdHMiLCJmaW5kIiwiY29uZmlnIiwiYXNzaWduUHJvcHMiLCJfcHVzaE5vdGlmaWNhdGlvbiIsImRpc21pc3NBbGwiLCJwcm9wcyIsInByb3AiLCJpbmNvbWluZ1R5cGVzIiwic2xpY2UiLCJmaW5hbERlZmF1bHRUeXBlcyIsIm1hcCIsImRlZmF1bHRUeXBlIiwidXNlclR5cGVJZHgiLCJ1c2VyVHlwZSIsIkFwcCIsIm5vdHlmIiwidGVzdEZuIiwiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6Ijs7O0VBQU8sTUFBTUEsSUFBSSxHQUFJQyxFQUFFLElBQUs7SUFDMUIsSUFBSSxPQUFPQSxFQUFFLEtBQUssUUFBUSxJQUFJQSxFQUFFLEdBQUcsQ0FBQyxFQUFFO0VBQ3BDLElBQUEsTUFBTSxJQUFJQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtFQUN2QyxHQUFBO0lBQ0EsT0FBTyxJQUFJQyxPQUFPLENBQUNDLE9BQU8sSUFBSUMsVUFBVSxDQUFDRCxPQUFPLEVBQUVILEVBQUUsQ0FBQyxDQUFDLENBQUE7RUFDeEQsQ0FBQzs7RUNITSxlQUFlSyxZQUFZQSxHQUFHO0lBQ25DLE1BQU1OLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtFQUNoQixFQUFBLE9BQU8sRUFBRSxDQUFBO0VBQ1g7O0VDTEE7RUFDQTtBQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTs7RUFFQSxJQUFJTyxRQUFRLEdBQUcsWUFBVztJQUN0QkEsUUFBUSxHQUFHQyxNQUFNLENBQUNDLE1BQU0sSUFBSSxTQUFTRixRQUFRQSxDQUFDRyxDQUFDLEVBQUU7RUFDN0MsSUFBQSxLQUFLLElBQUlDLENBQUMsRUFBRUMsQ0FBQyxHQUFHLENBQUMsRUFBRUMsQ0FBQyxHQUFHQyxTQUFTLENBQUNDLE1BQU0sRUFBRUgsQ0FBQyxHQUFHQyxDQUFDLEVBQUVELENBQUMsRUFBRSxFQUFFO0VBQ2pERCxNQUFBQSxDQUFDLEdBQUdHLFNBQVMsQ0FBQ0YsQ0FBQyxDQUFDLENBQUE7UUFDaEIsS0FBSyxJQUFJSSxDQUFDLElBQUlMLENBQUMsRUFBRSxJQUFJSCxNQUFNLENBQUNTLFNBQVMsQ0FBQ0MsY0FBYyxDQUFDQyxJQUFJLENBQUNSLENBQUMsRUFBRUssQ0FBQyxDQUFDLEVBQUVOLENBQUMsQ0FBQ00sQ0FBQyxDQUFDLEdBQUdMLENBQUMsQ0FBQ0ssQ0FBQyxDQUFDLENBQUE7RUFDaEYsS0FBQTtFQUNBLElBQUEsT0FBT04sQ0FBQyxDQUFBO0tBQ1gsQ0FBQTtFQUNELEVBQUEsT0FBT0gsUUFBUSxDQUFDYSxLQUFLLENBQUMsSUFBSSxFQUFFTixTQUFTLENBQUMsQ0FBQTtFQUMxQyxDQUFDLENBQUE7RUFFRCxJQUFJTyxpQkFBaUIsZ0JBQWtCLFlBQVk7SUFDL0MsU0FBU0EsaUJBQWlCQSxDQUFDQyxPQUFPLEVBQUU7TUFDaEMsSUFBSSxDQUFDQSxPQUFPLEdBQUdBLE9BQU8sQ0FBQTtFQUN0QixJQUFBLElBQUksQ0FBQ0MsU0FBUyxHQUFHLEVBQUUsQ0FBQTtFQUN2QixHQUFBO0lBQ0FGLGlCQUFpQixDQUFDSixTQUFTLENBQUNPLEVBQUUsR0FBRyxVQUFVQyxTQUFTLEVBQUVDLEVBQUUsRUFBRTtNQUN0RCxJQUFJQyxTQUFTLEdBQUcsSUFBSSxDQUFDSixTQUFTLENBQUNFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtFQUMvQyxJQUFBLElBQUksQ0FBQ0YsU0FBUyxDQUFDRSxTQUFTLENBQUMsR0FBR0UsU0FBUyxDQUFDQyxNQUFNLENBQUMsQ0FBQ0YsRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUNyRCxDQUFBO0lBQ0RMLGlCQUFpQixDQUFDSixTQUFTLENBQUNZLFlBQVksR0FBRyxVQUFVSixTQUFTLEVBQUVLLEtBQUssRUFBRTtNQUNuRSxJQUFJQyxLQUFLLEdBQUcsSUFBSSxDQUFBO01BQ2hCLElBQUlKLFNBQVMsR0FBRyxJQUFJLENBQUNKLFNBQVMsQ0FBQ0UsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFBO0VBQy9DRSxJQUFBQSxTQUFTLENBQUNLLE9BQU8sQ0FBQyxVQUFVTixFQUFFLEVBQUU7RUFBRSxNQUFBLE9BQU9BLEVBQUUsQ0FBQztFQUFFTyxRQUFBQSxNQUFNLEVBQUVGLEtBQUs7RUFBRUQsUUFBQUEsS0FBSyxFQUFFQSxLQUFBQTtFQUFNLE9BQUMsQ0FBQyxDQUFBO0VBQUUsS0FBQyxDQUFDLENBQUE7S0FDbkYsQ0FBQTtFQUNELEVBQUEsT0FBT1QsaUJBQWlCLENBQUE7RUFDNUIsQ0FBQyxFQUFHLENBQUE7RUFDSixJQUFJYSxlQUFlLENBQUE7RUFDbkIsQ0FBQyxVQUFVQSxlQUFlLEVBQUU7SUFDeEJBLGVBQWUsQ0FBQ0EsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtJQUNuREEsZUFBZSxDQUFDQSxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFBO0VBQzdELENBQUMsRUFBRUEsZUFBZSxLQUFLQSxlQUFlLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQTtFQUM3QyxJQUFJQyxVQUFVLGdCQUFrQixZQUFZO0lBQ3hDLFNBQVNBLFVBQVVBLEdBQUc7TUFDbEIsSUFBSSxDQUFDQyxhQUFhLEdBQUcsRUFBRSxDQUFBO0VBQzNCLEdBQUE7RUFDQUQsRUFBQUEsVUFBVSxDQUFDbEIsU0FBUyxDQUFDb0IsSUFBSSxHQUFHLFVBQVVDLElBQUksRUFBRTtFQUN4QyxJQUFBLElBQUksQ0FBQ0YsYUFBYSxDQUFDQyxJQUFJLENBQUNDLElBQUksQ0FBQyxDQUFBO0VBQzdCLElBQUEsSUFBSSxDQUFDQyxRQUFRLENBQUNELElBQUksRUFBRUosZUFBZSxDQUFDTSxHQUFHLEVBQUUsSUFBSSxDQUFDSixhQUFhLENBQUMsQ0FBQTtLQUMvRCxDQUFBO0lBQ0RELFVBQVUsQ0FBQ2xCLFNBQVMsQ0FBQ3dCLE1BQU0sR0FBRyxVQUFVQyxLQUFLLEVBQUVDLEdBQUcsRUFBRTtFQUNoRCxJQUFBLElBQUlMLElBQUksR0FBRyxJQUFJLENBQUNGLGFBQWEsQ0FBQ0ssTUFBTSxDQUFDQyxLQUFLLEVBQUVDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0VBQ25ELElBQUEsSUFBSSxDQUFDSixRQUFRLENBQUNELElBQUksRUFBRUosZUFBZSxDQUFDVSxNQUFNLEVBQUUsSUFBSSxDQUFDUixhQUFhLENBQUMsQ0FBQTtFQUMvRCxJQUFBLE9BQU9FLElBQUksQ0FBQTtLQUNkLENBQUE7RUFDREgsRUFBQUEsVUFBVSxDQUFDbEIsU0FBUyxDQUFDNEIsT0FBTyxHQUFHLFVBQVVQLElBQUksRUFBRTtFQUMzQyxJQUFBLE9BQU8sSUFBSSxDQUFDRixhQUFhLENBQUNTLE9BQU8sQ0FBQ1AsSUFBSSxDQUFDLENBQUE7S0FDMUMsQ0FBQTtFQUNESCxFQUFBQSxVQUFVLENBQUNsQixTQUFTLENBQUM2QixRQUFRLEdBQUcsVUFBVUMsRUFBRSxFQUFFO01BQzFDLElBQUksQ0FBQ1IsUUFBUSxHQUFHUSxFQUFFLENBQUE7S0FDckIsQ0FBQTtFQUNELEVBQUEsT0FBT1osVUFBVSxDQUFBO0VBQ3JCLENBQUMsRUFBRyxDQUFBO0VBRUosSUFBSWEsVUFBVSxDQUFBO0VBQ2QsQ0FBQyxVQUFVQSxVQUFVLEVBQUU7RUFDbkJBLEVBQUFBLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUE7RUFDakNBLEVBQUFBLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUE7RUFDakMsQ0FBQyxFQUFFQSxVQUFVLEtBQUtBLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0VBQ25DLElBQUlDLGVBQWUsR0FBRztFQUNsQkMsRUFBQUEsS0FBSyxFQUFFLENBQ0g7RUFDSUMsSUFBQUEsSUFBSSxFQUFFLFNBQVM7RUFDZkMsSUFBQUEsU0FBUyxFQUFFLHVCQUF1QjtFQUNsQ0MsSUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJDLElBQUFBLElBQUksRUFBRTtFQUNGRixNQUFBQSxTQUFTLEVBQUUsc0JBQXNCO0VBQ2pDRyxNQUFBQSxPQUFPLEVBQUUsR0FBQTtFQUNiLEtBQUE7RUFDSixHQUFDLEVBQ0Q7RUFDSUosSUFBQUEsSUFBSSxFQUFFLE9BQU87RUFDYkMsSUFBQUEsU0FBUyxFQUFFLHFCQUFxQjtFQUNoQ0MsSUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJDLElBQUFBLElBQUksRUFBRTtFQUNGRixNQUFBQSxTQUFTLEVBQUUsb0JBQW9CO0VBQy9CRyxNQUFBQSxPQUFPLEVBQUUsR0FBQTtFQUNiLEtBQUE7RUFDSixHQUFDLENBQ0o7RUFDREMsRUFBQUEsUUFBUSxFQUFFLElBQUk7RUFDZEMsRUFBQUEsTUFBTSxFQUFFLElBQUk7RUFDWkMsRUFBQUEsUUFBUSxFQUFFO0VBQ05DLElBQUFBLENBQUMsRUFBRSxPQUFPO0VBQ1ZDLElBQUFBLENBQUMsRUFBRSxRQUFBO0tBQ047RUFDREMsRUFBQUEsV0FBVyxFQUFFLEtBQUE7RUFDakIsQ0FBQyxDQUFBO0VBRUQsSUFBSUMsU0FBUyxnQkFBa0IsWUFBWTtJQUN2QyxTQUFTQSxTQUFTQSxHQUFHO01BQ2pCLElBQUksQ0FBQzFCLGFBQWEsR0FBRyxFQUFFLENBQUE7RUFDdkIsSUFBQSxJQUFJLENBQUMyQixNQUFNLEdBQUcsRUFBRSxDQUFBO01BQ2hCLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUc7RUFDdkJDLE1BQUFBLElBQUksRUFBRSxZQUFZO0VBQ2xCQyxNQUFBQSxNQUFNLEVBQUUsUUFBUTtFQUNoQkMsTUFBQUEsS0FBSyxFQUFFLFVBQUE7T0FDVixDQUFBO01BQ0QsSUFBSSxDQUFDQyxtQkFBbUIsR0FBRztFQUN2QkMsTUFBQUEsR0FBRyxFQUFFLFlBQVk7RUFDakJILE1BQUFBLE1BQU0sRUFBRSxRQUFRO0VBQ2hCSSxNQUFBQSxNQUFNLEVBQUUsVUFBQTtPQUNYLENBQUE7RUFDRDtFQUNBLElBQUEsSUFBSUMsT0FBTyxHQUFHQyxRQUFRLENBQUNDLHNCQUFzQixFQUFFLENBQUE7RUFDL0MsSUFBQSxJQUFJQyxjQUFjLEdBQUcsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQztFQUFFcEIsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRUgsTUFBQUEsU0FBUyxFQUFFLE9BQUE7RUFBUSxLQUFDLENBQUMsQ0FBQTtFQUNwRm1CLElBQUFBLE9BQU8sQ0FBQ0ssV0FBVyxDQUFDRixjQUFjLENBQUMsQ0FBQTtFQUNuQ0YsSUFBQUEsUUFBUSxDQUFDSyxJQUFJLENBQUNELFdBQVcsQ0FBQ0wsT0FBTyxDQUFDLENBQUE7TUFDbEMsSUFBSSxDQUFDTyxTQUFTLEdBQUdKLGNBQWMsQ0FBQTtFQUMvQjtFQUNBLElBQUEsSUFBSSxDQUFDSyxxQkFBcUIsR0FBRyxJQUFJLENBQUNDLHlCQUF5QixFQUFFLENBQUE7TUFDN0QsSUFBSSxDQUFDQyxvQkFBb0IsRUFBRSxDQUFBO0VBQy9CLEdBQUE7SUFDQW5CLFNBQVMsQ0FBQzdDLFNBQVMsQ0FBQ08sRUFBRSxHQUFHLFVBQVVNLEtBQUssRUFBRUosRUFBRSxFQUFFO0VBQzFDLElBQUEsSUFBSXdELEVBQUUsQ0FBQTtFQUNOLElBQUEsSUFBSSxDQUFDbkIsTUFBTSxHQUFHeEQsUUFBUSxDQUFDQSxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQ3dELE1BQU0sQ0FBQyxHQUFHbUIsRUFBRSxHQUFHLEVBQUUsRUFBRUEsRUFBRSxDQUFDcEQsS0FBSyxDQUFDLEdBQUdKLEVBQUUsRUFBRXdELEVBQUUsRUFBRSxDQUFBO0tBQ25GLENBQUE7SUFDRHBCLFNBQVMsQ0FBQzdDLFNBQVMsQ0FBQ2tFLE1BQU0sR0FBRyxVQUFVQyxZQUFZLEVBQUVqQyxJQUFJLEVBQUU7RUFDdkQsSUFBQSxJQUFJQSxJQUFJLEtBQUtqQixlQUFlLENBQUNNLEdBQUcsRUFBRTtFQUM5QixNQUFBLElBQUksQ0FBQzZDLGVBQWUsQ0FBQ0QsWUFBWSxDQUFDLENBQUE7RUFDdEMsS0FBQyxNQUNJLElBQUlqQyxJQUFJLEtBQUtqQixlQUFlLENBQUNVLE1BQU0sRUFBRTtFQUN0QyxNQUFBLElBQUksQ0FBQzBDLGtCQUFrQixDQUFDRixZQUFZLENBQUMsQ0FBQTtFQUN6QyxLQUFBO0tBQ0gsQ0FBQTtFQUNEdEIsRUFBQUEsU0FBUyxDQUFDN0MsU0FBUyxDQUFDcUUsa0JBQWtCLEdBQUcsVUFBVUYsWUFBWSxFQUFFO01BQzdELElBQUlyRCxLQUFLLEdBQUcsSUFBSSxDQUFBO0VBQ2hCLElBQUEsSUFBSXdELG9CQUFvQixHQUFHLElBQUksQ0FBQ0Msd0JBQXdCLENBQUNKLFlBQVksQ0FBQyxDQUFBO0VBQ3RFLElBQUEsSUFBSUssSUFBSSxDQUFBO01BQ1IsSUFBSSxDQUFDRixvQkFBb0IsRUFBRTtFQUN2QixNQUFBLE9BQUE7RUFDSixLQUFBO01BQ0FFLElBQUksR0FBR0Ysb0JBQW9CLENBQUNFLElBQUksQ0FBQTtFQUNoQ0EsSUFBQUEsSUFBSSxDQUFDQyxTQUFTLENBQUNDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0VBQzdDLElBQUEsSUFBSUMsV0FBVyxDQUFBO0VBQ2ZILElBQUFBLElBQUksQ0FBQ0ksZ0JBQWdCLENBQUMsSUFBSSxDQUFDZCxxQkFBcUIsRUFBR2EsV0FBVyxHQUFHLFVBQVU5RCxLQUFLLEVBQUU7RUFDOUUsTUFBQSxJQUFJQSxLQUFLLENBQUNHLE1BQU0sS0FBS3dELElBQUksRUFBRTtVQUN2QkEsSUFBSSxDQUFDSyxtQkFBbUIsQ0FBQy9ELEtBQUssQ0FBQ2dELHFCQUFxQixFQUFFYSxXQUFXLENBQUMsQ0FBQTtFQUNsRTdELFFBQUFBLEtBQUssQ0FBQytDLFNBQVMsQ0FBQ2lCLFdBQVcsQ0FBQ04sSUFBSSxDQUFDLENBQUE7RUFDckMsT0FBQTtFQUNKLEtBQUUsQ0FBQyxDQUFBO0tBQ04sQ0FBQTtFQUNEM0IsRUFBQUEsU0FBUyxDQUFDN0MsU0FBUyxDQUFDb0UsZUFBZSxHQUFHLFVBQVVELFlBQVksRUFBRTtFQUMxRCxJQUFBLElBQUlLLElBQUksR0FBRyxJQUFJLENBQUNPLG1CQUFtQixDQUFDWixZQUFZLENBQUMsQ0FBQTtFQUNqRCxJQUFBLElBQUksQ0FBQ2hELGFBQWEsQ0FBQ0MsSUFBSSxDQUFDO0VBQUUrQyxNQUFBQSxZQUFZLEVBQUVBLFlBQVk7RUFBRUssTUFBQUEsSUFBSSxFQUFFQSxJQUFBQTtFQUFLLEtBQUMsQ0FBQyxDQUFBO0VBQ25FO0VBQ0E7TUFDQSxJQUFJLENBQUNRLFNBQVMsQ0FBQ2IsWUFBWSxDQUFDOUQsT0FBTyxDQUFDNEUsT0FBTyxJQUFJLGNBQWMsQ0FBQyxDQUFBO0tBQ2pFLENBQUE7RUFDRHBDLEVBQUFBLFNBQVMsQ0FBQzdDLFNBQVMsQ0FBQytFLG1CQUFtQixHQUFHLFVBQVVaLFlBQVksRUFBRTtFQUM5RCxJQUFBLElBQUlGLEVBQUUsQ0FBQTtFQUNOLElBQUEsSUFBSWlCLElBQUksR0FBRyxJQUFJLENBQUNDLHNCQUFzQixDQUFDaEIsWUFBWSxDQUFDLENBQUE7RUFDcEQsSUFBQSxJQUFJaEMsU0FBUyxHQUFHZ0MsWUFBWSxDQUFDOUQsT0FBTyxDQUFDOEIsU0FBUyxDQUFBO0VBQzlDLElBQUEsSUFBSUEsU0FBUyxFQUFFO0VBQ1gsTUFBQSxDQUFDOEIsRUFBRSxHQUFHaUIsSUFBSSxDQUFDVCxTQUFTLEVBQUVDLEdBQUcsQ0FBQ3ZFLEtBQUssQ0FBQzhELEVBQUUsRUFBRTlCLFNBQVMsQ0FBQ2lELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0VBQzdELEtBQUE7RUFDQSxJQUFBLElBQUksQ0FBQ3ZCLFNBQVMsQ0FBQ0YsV0FBVyxDQUFDdUIsSUFBSSxDQUFDLENBQUE7RUFDaEMsSUFBQSxPQUFPQSxJQUFJLENBQUE7S0FDZCxDQUFBO0VBQ0RyQyxFQUFBQSxTQUFTLENBQUM3QyxTQUFTLENBQUN1RSx3QkFBd0IsR0FBRyxVQUFVSixZQUFZLEVBQUU7TUFDbkUsSUFBSWtCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtFQUNaLElBQUEsS0FBSyxJQUFJMUYsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ3dCLGFBQWEsQ0FBQ3JCLE1BQU0sSUFBSXVGLEdBQUcsR0FBRyxDQUFDLEVBQUUxRixDQUFDLEVBQUUsRUFBRTtRQUMzRCxJQUFJLElBQUksQ0FBQ3dCLGFBQWEsQ0FBQ3hCLENBQUMsQ0FBQyxDQUFDd0UsWUFBWSxLQUFLQSxZQUFZLEVBQUU7RUFDckRrQixRQUFBQSxHQUFHLEdBQUcxRixDQUFDLENBQUE7RUFDWCxPQUFBO0VBQ0osS0FBQTtFQUNBLElBQUEsSUFBSTBGLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtFQUNaLE1BQUEsT0FBTyxJQUFJLENBQUNsRSxhQUFhLENBQUNLLE1BQU0sQ0FBQzZELEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUMvQyxLQUFBO0VBQ0EsSUFBQSxPQUFBO0tBQ0gsQ0FBQTtFQUNEeEMsRUFBQUEsU0FBUyxDQUFDN0MsU0FBUyxDQUFDc0YsWUFBWSxHQUFHLFVBQVVqRixPQUFPLEVBQUU7RUFDbEQsSUFBQSxJQUFJNEQsRUFBRSxDQUFBO0VBQ04sSUFBQSxPQUFPLENBQUMsQ0FBQ0EsRUFBRSxHQUFHNUQsT0FBTyxLQUFLLElBQUksSUFBSUEsT0FBTyxLQUFLLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHQSxPQUFPLENBQUNvQyxRQUFRLE1BQU0sSUFBSSxJQUFJd0IsRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHQSxFQUFFLENBQUN2QixDQUFDLEtBQUssT0FBTyxDQUFBO0tBQzFJLENBQUE7RUFDREcsRUFBQUEsU0FBUyxDQUFDN0MsU0FBUyxDQUFDdUYsWUFBWSxHQUFHLFVBQVVsRixPQUFPLEVBQUU7RUFDbEQsSUFBQSxJQUFJNEQsRUFBRSxDQUFBO0VBQ04sSUFBQSxPQUFPLENBQUMsQ0FBQ0EsRUFBRSxHQUFHNUQsT0FBTyxLQUFLLElBQUksSUFBSUEsT0FBTyxLQUFLLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHQSxPQUFPLENBQUNvQyxRQUFRLE1BQU0sSUFBSSxJQUFJd0IsRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHQSxFQUFFLENBQUN0QixDQUFDLEtBQUssUUFBUSxDQUFBO0tBQzNJLENBQUE7RUFDREUsRUFBQUEsU0FBUyxDQUFDN0MsU0FBUyxDQUFDd0Ysd0JBQXdCLEdBQUcsVUFBVW5GLE9BQU8sRUFBRTtFQUM5RCxJQUFBLElBQUlvRixLQUFLLEdBQUcsSUFBSSxDQUFDMUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDdUMsWUFBWSxDQUFDakYsT0FBTyxDQUFDLENBQUMsQ0FBQTtFQUNoRSxJQUFBLElBQUlxRixPQUFPLEdBQUcsSUFBSSxDQUFDdkMsbUJBQW1CLENBQUMsSUFBSSxDQUFDb0MsWUFBWSxDQUFDbEYsT0FBTyxDQUFDLENBQUMsQ0FBQTtFQUNsRSxJQUFBLElBQUlzRixLQUFLLEdBQUcsSUFBSSxDQUFDOUIsU0FBUyxDQUFDOEIsS0FBSyxDQUFBO0VBQ2hDQSxJQUFBQSxLQUFLLENBQUNDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRUYsT0FBTyxDQUFDLENBQUE7RUFDN0NDLElBQUFBLEtBQUssQ0FBQ0MsV0FBVyxDQUFDLGFBQWEsRUFBRUgsS0FBSyxDQUFDLENBQUE7S0FDMUMsQ0FBQTtFQUNENUMsRUFBQUEsU0FBUyxDQUFDN0MsU0FBUyxDQUFDbUYsc0JBQXNCLEdBQUcsVUFBVWhCLFlBQVksRUFBRTtNQUNqRSxJQUFJckQsS0FBSyxHQUFHLElBQUksQ0FBQTtFQUNoQixJQUFBLElBQUlULE9BQU8sR0FBRzhELFlBQVksQ0FBQzlELE9BQU8sQ0FBQTtFQUNsQyxJQUFBLElBQUl3RixRQUFRLEdBQUd4RixPQUFPLENBQUNnQyxJQUFJLENBQUE7RUFDM0I7RUFDQSxJQUFBLElBQUksQ0FBQ21ELHdCQUF3QixDQUFDbkYsT0FBTyxDQUFDLENBQUE7RUFDdEM7RUFDQSxJQUFBLElBQUl5RixnQkFBZ0IsR0FBRyxJQUFJLENBQUNwQyxrQkFBa0IsQ0FBQztFQUFFcEIsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRUgsTUFBQUEsU0FBUyxFQUFFLGNBQUE7RUFBZSxLQUFDLENBQUMsQ0FBQTtFQUM3RixJQUFBLElBQUlLLE1BQU0sR0FBRyxJQUFJLENBQUNrQixrQkFBa0IsQ0FBQztFQUFFcEIsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRUgsTUFBQUEsU0FBUyxFQUFFLGVBQUE7RUFBZ0IsS0FBQyxDQUFDLENBQUE7RUFDcEYsSUFBQSxJQUFJNEQsT0FBTyxHQUFHLElBQUksQ0FBQ3JDLGtCQUFrQixDQUFDO0VBQUVwQixNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFSCxNQUFBQSxTQUFTLEVBQUUsZ0JBQUE7RUFBaUIsS0FBQyxDQUFDLENBQUE7RUFDdEYsSUFBQSxJQUFJOEMsT0FBTyxHQUFHLElBQUksQ0FBQ3ZCLGtCQUFrQixDQUFDO0VBQUVwQixNQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFSCxNQUFBQSxTQUFTLEVBQUUsZ0JBQUE7RUFBaUIsS0FBQyxDQUFDLENBQUE7RUFDdEY4QyxJQUFBQSxPQUFPLENBQUNlLFNBQVMsR0FBRzNGLE9BQU8sQ0FBQzRFLE9BQU8sSUFBSSxFQUFFLENBQUE7TUFDekMsSUFBSWdCLFNBQVMsR0FBRzVGLE9BQU8sQ0FBQzZGLFVBQVUsSUFBSTdGLE9BQU8sQ0FBQytCLGVBQWUsQ0FBQTtFQUM3RDtFQUNBLElBQUEsSUFBSXlELFFBQVEsRUFBRTtFQUNWLE1BQUEsSUFBSU0sYUFBYSxHQUFHLElBQUksQ0FBQ3pDLGtCQUFrQixDQUFDO0VBQUVwQixRQUFBQSxPQUFPLEVBQUUsS0FBSztFQUFFSCxRQUFBQSxTQUFTLEVBQUUsYUFBQTtFQUFjLE9BQUMsQ0FBQyxDQUFBO1FBQ3pGLElBQUksT0FBTzBELFFBQVEsS0FBSyxRQUFRLElBQUlBLFFBQVEsWUFBWU8sTUFBTSxFQUMxREQsYUFBYSxDQUFDSCxTQUFTLEdBQUcsSUFBSUksTUFBTSxDQUFDUCxRQUFRLENBQUMsQ0FBQ1EsT0FBTyxFQUFFLENBQUE7RUFDNUQsTUFBQSxJQUFJLE9BQU9SLFFBQVEsS0FBSyxRQUFRLEVBQUU7RUFDOUIsUUFBQSxJQUFJNUIsRUFBRSxHQUFHNEIsUUFBUSxDQUFDdkQsT0FBTztZQUFFQSxPQUFPLEdBQUcyQixFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHQSxFQUFFO1lBQUVxQyxXQUFXLEdBQUdULFFBQVEsQ0FBQzFELFNBQVM7WUFBRW9FLElBQUksR0FBR1YsUUFBUSxDQUFDVSxJQUFJO1lBQUVDLEVBQUUsR0FBR1gsUUFBUSxDQUFDWSxLQUFLO1lBQUVBLEtBQUssR0FBR0QsRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHUCxTQUFTLEdBQUdPLEVBQUUsQ0FBQTtFQUNsTCxRQUFBLElBQUlFLFdBQVcsR0FBRyxJQUFJLENBQUNoRCxrQkFBa0IsQ0FBQztFQUFFcEIsVUFBQUEsT0FBTyxFQUFFQSxPQUFPO0VBQUVILFVBQUFBLFNBQVMsRUFBRW1FLFdBQVc7RUFBRUMsVUFBQUEsSUFBSSxFQUFFQSxJQUFBQTtFQUFLLFNBQUMsQ0FBQyxDQUFBO1VBQ25HLElBQUlFLEtBQUssRUFDTEMsV0FBVyxDQUFDZixLQUFLLENBQUNjLEtBQUssR0FBR0EsS0FBSyxDQUFBO0VBQ25DTixRQUFBQSxhQUFhLENBQUN4QyxXQUFXLENBQUMrQyxXQUFXLENBQUMsQ0FBQTtFQUMxQyxPQUFBO0VBQ0FYLE1BQUFBLE9BQU8sQ0FBQ3BDLFdBQVcsQ0FBQ3dDLGFBQWEsQ0FBQyxDQUFBO0VBQ3RDLEtBQUE7RUFDQUosSUFBQUEsT0FBTyxDQUFDcEMsV0FBVyxDQUFDc0IsT0FBTyxDQUFDLENBQUE7RUFDNUJhLElBQUFBLGdCQUFnQixDQUFDbkMsV0FBVyxDQUFDb0MsT0FBTyxDQUFDLENBQUE7RUFDckM7RUFDQSxJQUFBLElBQUlFLFNBQVMsRUFBRTtRQUNYLElBQUk1RixPQUFPLENBQUNtQyxNQUFNLEVBQUU7RUFDaEJBLFFBQUFBLE1BQU0sQ0FBQ21ELEtBQUssQ0FBQ08sVUFBVSxHQUFHRCxTQUFTLENBQUE7RUFDbkNILFFBQUFBLGdCQUFnQixDQUFDbkMsV0FBVyxDQUFDbkIsTUFBTSxDQUFDLENBQUE7RUFDeEMsT0FBQyxNQUNJO0VBQ0RzRCxRQUFBQSxnQkFBZ0IsQ0FBQ0gsS0FBSyxDQUFDTyxVQUFVLEdBQUdELFNBQVMsQ0FBQTtFQUNqRCxPQUFBO0VBQ0osS0FBQTtFQUNBO01BQ0EsSUFBSTVGLE9BQU8sQ0FBQ3VDLFdBQVcsRUFBRTtFQUNyQixNQUFBLElBQUkrRCxjQUFjLEdBQUcsSUFBSSxDQUFDakQsa0JBQWtCLENBQUM7RUFBRXBCLFFBQUFBLE9BQU8sRUFBRSxLQUFLO0VBQUVILFFBQUFBLFNBQVMsRUFBRSxnQkFBQTtFQUFpQixPQUFDLENBQUMsQ0FBQTtFQUM3RixNQUFBLElBQUl5RSxhQUFhLEdBQUcsSUFBSSxDQUFDbEQsa0JBQWtCLENBQUM7RUFDeENwQixRQUFBQSxPQUFPLEVBQUUsUUFBUTtFQUNqQkgsUUFBQUEsU0FBUyxFQUFFLG9CQUFBO0VBQ2YsT0FBQyxDQUFDLENBQUE7RUFDRndFLE1BQUFBLGNBQWMsQ0FBQ2hELFdBQVcsQ0FBQ2lELGFBQWEsQ0FBQyxDQUFBO0VBQ3pDYixNQUFBQSxPQUFPLENBQUNwQyxXQUFXLENBQUNnRCxjQUFjLENBQUMsQ0FBQTtFQUNuQ2IsTUFBQUEsZ0JBQWdCLENBQUNyQixTQUFTLENBQUNDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO0VBQzNEa0MsTUFBQUEsYUFBYSxDQUFDaEMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVUvRCxLQUFLLEVBQUU7VUFDckQsSUFBSW9ELEVBQUUsRUFBRXVDLEVBQUUsQ0FBQTtFQUNWLFFBQUEsQ0FBQ0EsRUFBRSxHQUFHLENBQUN2QyxFQUFFLEdBQUduRCxLQUFLLENBQUNnQyxNQUFNLEVBQUVmLFVBQVUsQ0FBQzhFLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSUwsRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHQSxFQUFFLENBQUN0RyxJQUFJLENBQUMrRCxFQUFFLEVBQUU7RUFBRWpELFVBQUFBLE1BQU0sRUFBRW1ELFlBQVk7RUFBRXRELFVBQUFBLEtBQUssRUFBRUEsS0FBQUE7RUFBTSxTQUFDLENBQUMsQ0FBQTtVQUN2SUEsS0FBSyxDQUFDaUcsZUFBZSxFQUFFLENBQUE7RUFDM0IsT0FBQyxDQUFDLENBQUE7RUFDTixLQUFBO0VBQ0FoQixJQUFBQSxnQkFBZ0IsQ0FBQ2xCLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFVL0QsS0FBSyxFQUFFO1FBQUUsSUFBSW9ELEVBQUUsRUFBRXVDLEVBQUUsQ0FBQTtFQUFFLE1BQUEsT0FBTyxDQUFDQSxFQUFFLEdBQUcsQ0FBQ3ZDLEVBQUUsR0FBR25ELEtBQUssQ0FBQ2dDLE1BQU0sRUFBRWYsVUFBVSxDQUFDZ0YsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJUCxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUdBLEVBQUUsQ0FBQ3RHLElBQUksQ0FBQytELEVBQUUsRUFBRTtFQUFFakQsUUFBQUEsTUFBTSxFQUFFbUQsWUFBWTtFQUFFdEQsUUFBQUEsS0FBSyxFQUFFQSxLQUFBQTtFQUFNLE9BQUMsQ0FBQyxDQUFBO0VBQUUsS0FBQyxDQUFDLENBQUE7RUFDMU47RUFDQSxJQUFBLElBQUlzQixTQUFTLEdBQUcsSUFBSSxDQUFDb0QsWUFBWSxDQUFDbEYsT0FBTyxDQUFDLEtBQUssS0FBSyxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUE7TUFDeEV5RixnQkFBZ0IsQ0FBQ3JCLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLGdCQUFnQixHQUFHdkMsU0FBUyxDQUFDLENBQUE7RUFDNUQsSUFBQSxPQUFPMkQsZ0JBQWdCLENBQUE7S0FDMUIsQ0FBQTtFQUNEakQsRUFBQUEsU0FBUyxDQUFDN0MsU0FBUyxDQUFDMEQsa0JBQWtCLEdBQUcsVUFBVU8sRUFBRSxFQUFFO0VBQ25ELElBQUEsSUFBSTNCLE9BQU8sR0FBRzJCLEVBQUUsQ0FBQzNCLE9BQU87UUFBRUgsU0FBUyxHQUFHOEIsRUFBRSxDQUFDOUIsU0FBUztRQUFFb0UsSUFBSSxHQUFHdEMsRUFBRSxDQUFDc0MsSUFBSSxDQUFBO0VBQ2xFLElBQUEsSUFBSWxGLElBQUksR0FBR2tDLFFBQVEsQ0FBQ3lELGFBQWEsQ0FBQzFFLE9BQU8sQ0FBQyxDQUFBO0VBQzFDLElBQUEsSUFBSUgsU0FBUyxFQUFFO1FBQ1hkLElBQUksQ0FBQ2MsU0FBUyxHQUFHQSxTQUFTLENBQUE7RUFDOUIsS0FBQTtFQUNBZCxJQUFBQSxJQUFJLENBQUM0RixXQUFXLEdBQUdWLElBQUksSUFBSSxJQUFJLENBQUE7RUFDL0IsSUFBQSxPQUFPbEYsSUFBSSxDQUFBO0tBQ2QsQ0FBQTtFQUNEO0VBQ0o7RUFDQTtFQUNBO0VBQ0l3QixFQUFBQSxTQUFTLENBQUM3QyxTQUFTLENBQUNnRSxvQkFBb0IsR0FBRyxZQUFZO0VBQ25ELElBQUEsSUFBSWtELGFBQWEsR0FBRyxJQUFJLENBQUN4RCxrQkFBa0IsQ0FBQztFQUFFcEIsTUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFBRUgsTUFBQUEsU0FBUyxFQUFFLGlCQUFBO0VBQWtCLEtBQUMsQ0FBQyxDQUFBO0VBQzdGK0UsSUFBQUEsYUFBYSxDQUFDQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ2pERCxJQUFBQSxhQUFhLENBQUNDLFlBQVksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUE7RUFDakQ7RUFDQTtFQUNBRCxJQUFBQSxhQUFhLENBQUN2QixLQUFLLENBQUN5QixNQUFNLEdBQUcsR0FBRyxDQUFBO0VBQ2hDRixJQUFBQSxhQUFhLENBQUN2QixLQUFLLENBQUMwQixJQUFJLEdBQUcsZUFBZSxDQUFBO0VBQzFDSCxJQUFBQSxhQUFhLENBQUN2QixLQUFLLENBQUMyQixNQUFNLEdBQUcsS0FBSyxDQUFBO0VBQ2xDSixJQUFBQSxhQUFhLENBQUN2QixLQUFLLENBQUM0QixNQUFNLEdBQUcsTUFBTSxDQUFBO0VBQ25DTCxJQUFBQSxhQUFhLENBQUN2QixLQUFLLENBQUM2QixRQUFRLEdBQUcsUUFBUSxDQUFBO0VBQ3ZDTixJQUFBQSxhQUFhLENBQUN2QixLQUFLLENBQUM4QixPQUFPLEdBQUcsR0FBRyxDQUFBO0VBQ2pDUCxJQUFBQSxhQUFhLENBQUN2QixLQUFLLENBQUNsRCxRQUFRLEdBQUcsVUFBVSxDQUFBO0VBQ3pDeUUsSUFBQUEsYUFBYSxDQUFDdkIsS0FBSyxDQUFDK0IsS0FBSyxHQUFHLEtBQUssQ0FBQTtFQUNqQ1IsSUFBQUEsYUFBYSxDQUFDdkIsS0FBSyxDQUFDZ0MsT0FBTyxHQUFHLEdBQUcsQ0FBQTtFQUNqQ3BFLElBQUFBLFFBQVEsQ0FBQ0ssSUFBSSxDQUFDRCxXQUFXLENBQUN1RCxhQUFhLENBQUMsQ0FBQTtNQUN4QyxJQUFJLENBQUNBLGFBQWEsR0FBR0EsYUFBYSxDQUFBO0tBQ3JDLENBQUE7RUFDRDtFQUNKO0VBQ0E7RUFDSXJFLEVBQUFBLFNBQVMsQ0FBQzdDLFNBQVMsQ0FBQ2dGLFNBQVMsR0FBRyxVQUFVQyxPQUFPLEVBQUU7TUFDL0MsSUFBSW5FLEtBQUssR0FBRyxJQUFJLENBQUE7RUFDaEIsSUFBQSxJQUFJLENBQUNvRyxhQUFhLENBQUNELFdBQVcsR0FBRyxFQUFFLENBQUE7RUFDbkM7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E3SCxJQUFBQSxVQUFVLENBQUMsWUFBWTtFQUNuQjBCLE1BQUFBLEtBQUssQ0FBQ29HLGFBQWEsQ0FBQ0QsV0FBVyxHQUFHaEMsT0FBTyxDQUFBO09BQzVDLEVBQUUsR0FBRyxDQUFDLENBQUE7S0FDVixDQUFBO0VBQ0Q7RUFDSjtFQUNBO0VBQ0lwQyxFQUFBQSxTQUFTLENBQUM3QyxTQUFTLENBQUMrRCx5QkFBeUIsR0FBRyxZQUFZO0VBQ3hELElBQUEsSUFBSTZELEVBQUUsR0FBR3JFLFFBQVEsQ0FBQ3lELGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtFQUN4QyxJQUFBLElBQUlhLFdBQVcsR0FBRztFQUNkQyxNQUFBQSxhQUFhLEVBQUUsY0FBYztFQUM3QkMsTUFBQUEsV0FBVyxFQUFFLGVBQWU7RUFDNUJDLE1BQUFBLGdCQUFnQixFQUFFLG9CQUFvQjtFQUN0Q0MsTUFBQUEsVUFBVSxFQUFFLGNBQUE7T0FDZixDQUFBO0VBQ0QsSUFBQSxJQUFJeEksQ0FBQyxDQUFBO01BQ0wsS0FBS0EsQ0FBQyxJQUFJb0ksV0FBVyxFQUFFO1FBQ25CLElBQUlELEVBQUUsQ0FBQ2pDLEtBQUssQ0FBQ2xHLENBQUMsQ0FBQyxLQUFLeUksU0FBUyxFQUFFO1VBQzNCLE9BQU9MLFdBQVcsQ0FBQ3BJLENBQUMsQ0FBQyxDQUFBO0VBQ3pCLE9BQUE7RUFDSixLQUFBO0VBQ0E7RUFDQSxJQUFBLE9BQU8sY0FBYyxDQUFBO0tBQ3hCLENBQUE7RUFDRCxFQUFBLE9BQU9vRCxTQUFTLENBQUE7RUFDcEIsQ0FBQyxFQUFHLENBQUE7O0VBRUo7RUFDQTtFQUNBO0VBQ0EsSUFBSXNGLEtBQUssZ0JBQWtCLFlBQVk7SUFDbkMsU0FBU0EsS0FBS0EsQ0FBQ0MsSUFBSSxFQUFFO01BQ2pCLElBQUl0SCxLQUFLLEdBQUcsSUFBSSxDQUFBO0VBQ2hCLElBQUEsSUFBSSxDQUFDdUgsT0FBTyxHQUFHLElBQUksQ0FBQ0MsbUJBQW1CLENBQUE7RUFDdkMsSUFBQSxJQUFJLENBQUNuSCxhQUFhLEdBQUcsSUFBSUQsVUFBVSxFQUFFLENBQUE7RUFDckMsSUFBQSxJQUFJLENBQUNxSCxJQUFJLEdBQUcsSUFBSTFGLFNBQVMsRUFBRSxDQUFBO0VBQzNCLElBQUEsSUFBSVosS0FBSyxHQUFHLElBQUksQ0FBQ3VHLGFBQWEsQ0FBQ0osSUFBSSxDQUFDLENBQUE7RUFDcEMsSUFBQSxJQUFJLENBQUMvSCxPQUFPLEdBQUdmLFFBQVEsQ0FBQ0EsUUFBUSxDQUFDLEVBQUUsRUFBRTBDLGVBQWUsQ0FBQyxFQUFFb0csSUFBSSxDQUFDLENBQUE7RUFDNUQsSUFBQSxJQUFJLENBQUMvSCxPQUFPLENBQUM0QixLQUFLLEdBQUdBLEtBQUssQ0FBQTtNQUMxQixJQUFJLENBQUNkLGFBQWEsQ0FBQ1UsUUFBUSxDQUFDLFVBQVVSLElBQUksRUFBRWEsSUFBSSxFQUFFO1FBQUUsT0FBT3BCLEtBQUssQ0FBQ3lILElBQUksQ0FBQ3JFLE1BQU0sQ0FBQzdDLElBQUksRUFBRWEsSUFBSSxDQUFDLENBQUE7RUFBRSxLQUFDLENBQUMsQ0FBQTtNQUM1RixJQUFJLENBQUNxRyxJQUFJLENBQUNoSSxFQUFFLENBQUN3QixVQUFVLENBQUM4RSxPQUFPLEVBQUUsVUFBVTVDLEVBQUUsRUFBRTtFQUMzQyxNQUFBLElBQUlqRCxNQUFNLEdBQUdpRCxFQUFFLENBQUNqRCxNQUFNO1VBQUVILEtBQUssR0FBR29ELEVBQUUsQ0FBQ3BELEtBQUssQ0FBQTtFQUN4Q0MsTUFBQUEsS0FBSyxDQUFDd0gsbUJBQW1CLENBQUN0SCxNQUFNLENBQUMsQ0FBQTtFQUNqQztRQUNBQSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUNlLFVBQVUsQ0FBQzhFLE9BQU8sRUFBRWhHLEtBQUssQ0FBQyxDQUFBO0VBQ3JELEtBQUMsQ0FBQyxDQUFBO0VBQ0Y7TUFDQSxJQUFJLENBQUMwSCxJQUFJLENBQUNoSSxFQUFFLENBQUN3QixVQUFVLENBQUNnRixLQUFLLEVBQUUsVUFBVTlDLEVBQUUsRUFBRTtFQUN6QyxNQUFBLElBQUlqRCxNQUFNLEdBQUdpRCxFQUFFLENBQUNqRCxNQUFNO1VBQUVILEtBQUssR0FBR29ELEVBQUUsQ0FBQ3BELEtBQUssQ0FBQTtRQUN4QyxPQUFPRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUNlLFVBQVUsQ0FBQ2dGLEtBQUssRUFBRWxHLEtBQUssQ0FBQyxDQUFBO0VBQzFELEtBQUMsQ0FBQyxDQUFBO0VBQ04sR0FBQTtFQUNBc0gsRUFBQUEsS0FBSyxDQUFDbkksU0FBUyxDQUFDeUksS0FBSyxHQUFHLFVBQVVDLE9BQU8sRUFBRTtNQUN2QyxJQUFJckksT0FBTyxHQUFHLElBQUksQ0FBQ3NJLGdCQUFnQixDQUFDLE9BQU8sRUFBRUQsT0FBTyxDQUFDLENBQUE7RUFDckQsSUFBQSxPQUFPLElBQUksQ0FBQ0UsSUFBSSxDQUFDdkksT0FBTyxDQUFDLENBQUE7S0FDNUIsQ0FBQTtFQUNEOEgsRUFBQUEsS0FBSyxDQUFDbkksU0FBUyxDQUFDNkksT0FBTyxHQUFHLFVBQVVILE9BQU8sRUFBRTtNQUN6QyxJQUFJckksT0FBTyxHQUFHLElBQUksQ0FBQ3NJLGdCQUFnQixDQUFDLFNBQVMsRUFBRUQsT0FBTyxDQUFDLENBQUE7RUFDdkQsSUFBQSxPQUFPLElBQUksQ0FBQ0UsSUFBSSxDQUFDdkksT0FBTyxDQUFDLENBQUE7S0FDNUIsQ0FBQTtFQUNEOEgsRUFBQUEsS0FBSyxDQUFDbkksU0FBUyxDQUFDNEksSUFBSSxHQUFHLFVBQVV2SSxPQUFPLEVBQUU7RUFDdEMsSUFBQSxJQUFJeUksV0FBVyxHQUFHLElBQUksQ0FBQ3pJLE9BQU8sQ0FBQzRCLEtBQUssQ0FBQzhHLElBQUksQ0FBQyxVQUFVOUUsRUFBRSxFQUFFO0VBQ3BELE1BQUEsSUFBSS9CLElBQUksR0FBRytCLEVBQUUsQ0FBQy9CLElBQUksQ0FBQTtFQUNsQixNQUFBLE9BQU9BLElBQUksS0FBSzdCLE9BQU8sQ0FBQzZCLElBQUksQ0FBQTtPQUMvQixDQUFDLElBQUksRUFBRSxDQUFBO0VBQ1IsSUFBQSxJQUFJOEcsTUFBTSxHQUFHMUosUUFBUSxDQUFDQSxRQUFRLENBQUMsRUFBRSxFQUFFd0osV0FBVyxDQUFDLEVBQUV6SSxPQUFPLENBQUMsQ0FBQTtFQUN6RCxJQUFBLElBQUksQ0FBQzRJLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxDQUFDLEVBQUVELE1BQU0sQ0FBQyxDQUFBO0VBQy9ELElBQUEsSUFBSTdFLFlBQVksR0FBRyxJQUFJL0QsaUJBQWlCLENBQUM0SSxNQUFNLENBQUMsQ0FBQTtFQUNoRCxJQUFBLElBQUksQ0FBQ0UsaUJBQWlCLENBQUMvRSxZQUFZLENBQUMsQ0FBQTtFQUNwQyxJQUFBLE9BQU9BLFlBQVksQ0FBQTtLQUN0QixDQUFBO0VBQ0RnRSxFQUFBQSxLQUFLLENBQUNuSSxTQUFTLENBQUNtSixVQUFVLEdBQUcsWUFBWTtNQUNyQyxPQUFPLElBQUksQ0FBQ2hJLGFBQWEsQ0FBQ0ssTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDbEMsQ0FBQTtLQUNQLENBQUE7RUFDRDtFQUNKO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0lBQ0kyRyxLQUFLLENBQUNuSSxTQUFTLENBQUNpSixXQUFXLEdBQUcsVUFBVUcsS0FBSyxFQUFFSixNQUFNLEVBQUU7TUFDbkQsSUFBSWxJLEtBQUssR0FBRyxJQUFJLENBQUE7RUFDaEJzSSxJQUFBQSxLQUFLLENBQUNySSxPQUFPLENBQUMsVUFBVXNJLElBQUksRUFBRTtFQUMxQjtRQUNBTCxNQUFNLENBQUNLLElBQUksQ0FBQyxHQUFHTCxNQUFNLENBQUNLLElBQUksQ0FBQyxJQUFJLElBQUksR0FBR3ZJLEtBQUssQ0FBQ1QsT0FBTyxDQUFDZ0osSUFBSSxDQUFDLEdBQUdMLE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLENBQUE7RUFDNUUsS0FBQyxDQUFDLENBQUE7S0FDTCxDQUFBO0VBQ0RsQixFQUFBQSxLQUFLLENBQUNuSSxTQUFTLENBQUNrSixpQkFBaUIsR0FBRyxVQUFVL0UsWUFBWSxFQUFFO01BQ3hELElBQUlyRCxLQUFLLEdBQUcsSUFBSSxDQUFBO0VBQ2hCLElBQUEsSUFBSSxDQUFDSyxhQUFhLENBQUNDLElBQUksQ0FBQytDLFlBQVksQ0FBQyxDQUFBO01BQ3JDLElBQUk1QixRQUFRLEdBQUc0QixZQUFZLENBQUM5RCxPQUFPLENBQUNrQyxRQUFRLEtBQUsyRixTQUFTLEdBQUcvRCxZQUFZLENBQUM5RCxPQUFPLENBQUNrQyxRQUFRLEdBQUcsSUFBSSxDQUFDbEMsT0FBTyxDQUFDa0MsUUFBUSxDQUFBO0VBQ2xILElBQUEsSUFBSUEsUUFBUSxFQUFFO0VBQ1ZuRCxNQUFBQSxVQUFVLENBQUMsWUFBWTtFQUFFLFFBQUEsT0FBTzBCLEtBQUssQ0FBQ3dILG1CQUFtQixDQUFDbkUsWUFBWSxDQUFDLENBQUE7U0FBRyxFQUFFNUIsUUFBUSxDQUFDLENBQUE7RUFDekYsS0FBQTtLQUNILENBQUE7RUFDRDRGLEVBQUFBLEtBQUssQ0FBQ25JLFNBQVMsQ0FBQ3NJLG1CQUFtQixHQUFHLFVBQVVuRSxZQUFZLEVBQUU7TUFDMUQsSUFBSTFDLEtBQUssR0FBRyxJQUFJLENBQUNOLGFBQWEsQ0FBQ1MsT0FBTyxDQUFDdUMsWUFBWSxDQUFDLENBQUE7RUFDcEQsSUFBQSxJQUFJMUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ2QsSUFBSSxDQUFDTixhQUFhLENBQUNLLE1BQU0sQ0FBQ0MsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBO0VBQ3ZDLEtBQUE7S0FDSCxDQUFBO0lBQ0QwRyxLQUFLLENBQUNuSSxTQUFTLENBQUMySSxnQkFBZ0IsR0FBRyxVQUFVekcsSUFBSSxFQUFFd0csT0FBTyxFQUFFO0VBQ3hELElBQUEsSUFBSXJJLE9BQU8sR0FBRztFQUFFNkIsTUFBQUEsSUFBSSxFQUFFQSxJQUFBQTtPQUFNLENBQUE7RUFDNUIsSUFBQSxJQUFJLE9BQU93RyxPQUFPLEtBQUssUUFBUSxFQUFFO1FBQzdCckksT0FBTyxDQUFDNEUsT0FBTyxHQUFHeUQsT0FBTyxDQUFBO0VBQzdCLEtBQUMsTUFDSSxJQUFJLE9BQU9BLE9BQU8sS0FBSyxRQUFRLEVBQUU7RUFDbENySSxNQUFBQSxPQUFPLEdBQUdmLFFBQVEsQ0FBQ0EsUUFBUSxDQUFDLEVBQUUsRUFBRWUsT0FBTyxDQUFDLEVBQUVxSSxPQUFPLENBQUMsQ0FBQTtFQUN0RCxLQUFBO0VBQ0EsSUFBQSxPQUFPckksT0FBTyxDQUFBO0tBQ2pCLENBQUE7RUFDRDhILEVBQUFBLEtBQUssQ0FBQ25JLFNBQVMsQ0FBQ3dJLGFBQWEsR0FBRyxVQUFVSixJQUFJLEVBQUU7RUFDNUMsSUFBQSxJQUFJa0IsYUFBYSxHQUFHLENBQUVsQixJQUFJLElBQUlBLElBQUksQ0FBQ25HLEtBQUssSUFBSyxFQUFFLEVBQUVzSCxLQUFLLEVBQUUsQ0FBQTtNQUN4RCxJQUFJQyxpQkFBaUIsR0FBR3hILGVBQWUsQ0FBQ0MsS0FBSyxDQUFDd0gsR0FBRyxDQUFDLFVBQVVDLFdBQVcsRUFBRTtFQUNyRTtFQUNBO1FBQ0EsSUFBSUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFBO0VBQ3BCTCxNQUFBQSxhQUFhLENBQUN2SSxPQUFPLENBQUMsVUFBVXRCLENBQUMsRUFBRTRGLEdBQUcsRUFBRTtVQUNwQyxJQUFJNUYsQ0FBQyxDQUFDeUMsSUFBSSxLQUFLd0gsV0FBVyxDQUFDeEgsSUFBSSxFQUMzQnlILFdBQVcsR0FBR3RFLEdBQUcsQ0FBQTtFQUN6QixPQUFDLENBQUMsQ0FBQTtRQUNGLElBQUl1RSxRQUFRLEdBQUdELFdBQVcsS0FBSyxDQUFDLENBQUMsR0FBR0wsYUFBYSxDQUFDOUgsTUFBTSxDQUFDbUksV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNoRixPQUFPckssUUFBUSxDQUFDQSxRQUFRLENBQUMsRUFBRSxFQUFFb0ssV0FBVyxDQUFDLEVBQUVFLFFBQVEsQ0FBQyxDQUFBO0VBQ3hELEtBQUMsQ0FBQyxDQUFBO0VBQ0YsSUFBQSxPQUFPSixpQkFBaUIsQ0FBQzdJLE1BQU0sQ0FBQzJJLGFBQWEsQ0FBQyxDQUFBO0tBQ2pELENBQUE7RUFDRCxFQUFBLE9BQU9uQixLQUFLLENBQUE7RUFDaEIsQ0FBQyxFQUFHOztFQ25iSixNQUFNMEIsR0FBRyxHQUFHLFlBQVk7RUFDdEIsRUFBQSxNQUFNQyxLQUFLLEdBQUcsSUFBSTNCLEtBQUssRUFBRSxDQUFBO0VBRXpCLEVBQUEsTUFBTTRCLE1BQU0sR0FBRyxZQUFZO0VBQ3pCLElBQUEsTUFBTXJILENBQUMsR0FBRyxNQUFNckQsWUFBWSxFQUFFLENBQUE7RUFDOUIySyxJQUFBQSxPQUFPLENBQUNDLEdBQUcsQ0FBQ3ZILENBQUMsQ0FBQyxDQUFBO0VBRWRvSCxJQUFBQSxLQUFLLENBQUNyQixLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtLQUN4QyxDQUFBO0VBRURzQixFQUFBQSxNQUFNLEVBQUUsQ0FBQTtFQUNWLENBQUMsQ0FBQTtFQUVERixHQUFHLEVBQUU7Ozs7OzsifQ==