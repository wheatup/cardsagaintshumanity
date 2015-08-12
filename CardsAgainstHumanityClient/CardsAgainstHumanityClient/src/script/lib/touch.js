!function ($) {
    window.indream = window.indream || {};
    $.indream = indream;
    //Define events
    indream.touch = {
        evenList: {
            touchStart: {
                htmlEvent: 'touchstart'
            },
            touchMove: {
                htmlEvent: 'touchmove'
            },
            touchEnd: {
                htmlEvent: 'touchend'
            },
            tapOrClick: {
                eventFunction: function (action) {
                    $(this).each(function () {
                        (function (hasTouched) {
                            $(this).touchEnd(function (e) {
                                hasTouched = true;
                                action.call(this, e);
                            });
                            $(this).click(function (e) {
                                if (!hasTouched) {
                                    action.call(this, e);
                                }
                            });
                        }).call(this, false);
                    });
                    return this;
                }
            },
            moveOrScroll: {
                eventFunction: function (action) {
                    $(this).each(function () {
                        (function (hasTouched) {
                            $(this).touchMove(function (e) {
                                hasTouched = true;
                                action.call(this, e);
                            });
                            $(this).scroll(function (e) {
                                if (!hasTouched) {
                                    action.call(this, e);
                                }
                            });
                        }).call(this, false);
                    });
                    return this;
                }
            }
        }
    }

    //Add events into jquery
    for (var eventName in indream.touch.evenList) {
        var event = indream.touch.evenList[eventName];
        $.fn[eventName] = event.eventFunction || (function (eventName, htmlEvent) {
            return function (action) {
                $(this).each(function () {
                    $(this).bind(htmlEvent, action);
                    //Add event listener method for IE or others
                    if (this.attachEvent) {
                        this.attachEvent('on' + htmlEvent, function (e) {
                            $(this).on(eventName);
                        });
                    } else {
                        this.addEventListener(htmlEvent, function (e) {
                            $(this).on(eventName);
                        });
                    }
                });
                return this;
            }
        })(eventName, event.htmlEvent);
    }
}(window.jQuery);