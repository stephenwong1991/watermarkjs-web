(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Watermark = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
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
    /* global Reflect, Promise, SuppressedError, Symbol */


    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    /**
     * Determine if something is a non-infinite javascript number.
     * @param  {Number}  n A (potential) number to see if it is a number.
     * @return {Boolean} True for non-infinite numbers, false for all else.
     */
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    var defaultOptions = {
        target: document.body,
        content: "watermark",
        fontSize: 16,
        fontFamily: "Arial",
        color: "rgba(184, 184, 184, 0.5)",
        rotate: -15,
    };
    var dpr = window.devicePixelRatio || 1;
    var WATERMARK_TILE_WIDTH = 200;
    var WATERMARK_TILE_HEIGHT = 100;
    var Watermark = /** @class */ (function () {
        function Watermark(options) {
            // 水印base64
            this.dataURL = "";
            this.options = __assign(__assign({}, defaultOptions), options);
            this.targetElement = this.getTargetElement();
            this.dataURL = this.generateWatermarkTile();
            this.applyWatermark();
            this.listenEvent();
        }
        Watermark.prototype.getTargetElement = function () {
            if (typeof this.options.target === "string") {
                return (document.querySelector(this.options.target) ||
                    document.body);
            }
            if (this.options.target instanceof HTMLElement) {
                return this.options.target;
            }
            return document.body;
        };
        Watermark.prototype.generateWatermarkTile = function () {
            this.canvas = document.createElement("canvas");
            this.canvas.setAttribute("width", "".concat(WATERMARK_TILE_WIDTH, "px"));
            this.canvas.setAttribute("height", "".concat(WATERMARK_TILE_HEIGHT, "px"));
            this.canvas.width = WATERMARK_TILE_WIDTH * dpr;
            this.canvas.height = WATERMARK_TILE_HEIGHT * dpr;
            var ctx = this.canvas.getContext("2d");
            var _a = this.options, content = _a.content, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color, rotate = _a.rotate;
            var textFontSize = isNumber(fontSize) ? "".concat(fontSize, "px") : fontSize;
            ctx.scale(dpr, dpr);
            ctx.translate(WATERMARK_TILE_WIDTH / 2, WATERMARK_TILE_HEIGHT / 2);
            ctx.rotate((Math.PI / 180) * rotate);
            ctx.translate(-WATERMARK_TILE_WIDTH / 2, -WATERMARK_TILE_HEIGHT / 2);
            ctx.font = "".concat(textFontSize, " ").concat(fontFamily);
            ctx.fillStyle = color;
            ctx.fillText(content, WATERMARK_TILE_WIDTH / 4, WATERMARK_TILE_HEIGHT / 2);
            return this.canvas.toDataURL();
        };
        Watermark.prototype.applyWatermark = function () {
            var _a;
            var exists = this.isExistContainer();
            if (!exists) {
                (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
                this.container = document.createElement("div");
                this.targetElement.insertBefore(this.container, this.targetElement.firstChild);
            }
            // 这里需要做下判断，不然会因改动style，observe会不停触发
            var oldStyleStr = this.container.getAttribute("style");
            var containerStyleStr = this.generateContainerStyle();
            if (oldStyleStr !== containerStyleStr) {
                this.container.setAttribute("style", containerStyleStr);
            }
            if (!exists) {
                this.observe();
            }
        };
        Watermark.prototype.listenEvent = function () {
            var _this = this;
            var events = ["load", "resize"];
            events.forEach(function (event) {
                window.addEventListener(event, function () { return _this.applyWatermark(); }, false);
            });
        };
        Watermark.prototype.generateContainerStyle = function () {
            var rect = this.targetElement.getBoundingClientRect();
            var left = rect.left, top = rect.top, width = rect.width, height = rect.height;
            var containerStyle = {
                "pointer-events": "none",
                position: "absolute",
                left: left,
                top: top,
                "z-index": 2147483647,
                width: "".concat(width, "px"),
                height: "".concat(height, "px"),
                "background-image": "url(".concat(this.dataURL, ")"),
                "background-size": "".concat(WATERMARK_TILE_WIDTH, "px ").concat(WATERMARK_TILE_HEIGHT, "px"),
                "background-repeat": "repeat",
            };
            return Object.entries(containerStyle).reduce(function (prev, _a) {
                var key = _a[0], value = _a[1];
                return prev + "".concat(key, ":").concat(value, " !important;");
            }, "");
        };
        Watermark.prototype.isExistContainer = function () {
            return document.contains(this.container);
        };
        Watermark.prototype.isDeleteWatermark = function (removedNodes) {
            return Array.from(removedNodes).includes(this.container);
        };
        Watermark.prototype.observe = function () {
            var _this = this;
            this.observer = new MutationObserver(function (mutations) {
                for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
                    var mutation = mutations_1[_i];
                    if (mutation.target === _this.container) {
                        _this.applyWatermark();
                    }
                    if (mutation.type === "childList") {
                        if (_this.isDeleteWatermark(mutation.removedNodes)) {
                            _this.applyWatermark();
                        }
                        else {
                            _this.applyWatermark();
                        }
                    }
                }
            });
            this.observer.observe(this.targetElement, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        };
        return Watermark;
    }());

    return Watermark;

}));
