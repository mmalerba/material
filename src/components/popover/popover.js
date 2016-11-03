/**
 * @ngdoc module
 * @name material.components.popover
 */
angular
    .module('material.components.popover', [
      'material.core',
      'material.components.panel'
    ])
    .service('$mdPopover', MdPopoverService)
    .service('$mdPopoverRegistry', MdPopoverRegistryService)
    .directive('mdPopover', MdPopoverDirective);


/*****************************************************************************
 *                       MdPopover Service Documenation                      *
 *****************************************************************************/


/**
 * @ngdoc service
 * @name $mdPopover
 * @module material.components.popover
 * @description
 * `$mdPopover` is a helper service for handling the positioning, event binding,
 * and watchers for popovers and tooltips.
 */


/*****************************************************************************
 *                      MdPopover Reference Documenation                     *
 *****************************************************************************/


/**
 * @ngdoc type
 * @name MdPopoverRef
 * @module material.components.popover
 * @description
 * A reference to the created popover. This reference contains all of the
 * following properties:
 */


/*****************************************************************************
 *                  MdPopover Registry Service Documentation                 *
 *****************************************************************************/


/**
 * @ngdoc service
 * @name $mdPopoverRegistry
 * @module material.components.popover
 * @description
 * `$mdPopoverRegistry` is a service that is used to reduce the amount of
 * listeners that are being registered on the `window` by the popover component.
 * Works by collecting the individual event handlers and dispatching them from
 * a global handler.
 */


/*****************************************************************************
 *                      MdPopover Directive Documentation                    *
 *****************************************************************************/


/**
 * @ngdoc directive
 * @name mdPopover
 * @module material.components.popover
 * @description
 * Popovers are used to describe elements by providing sophisticated, rich
 * content that may be fully interactive.
 *
 * Place a `<md-popover>` as a child of the element it describes.
 *
 * A popover will activate when the user hovers over, focuses, or touches the
 * parent element.
 *
 * @usage
 * <hljs lang="html">
 *   <div layout="column" style="text-align: center">
 *     <img class="md-border-radius-round" src="img/100-2.jpeg" width="100" />
 *     <h1 class="md-title">Miscellaneous Title</h1>
 *     <p><strong>Miscellaneous Subtitle</strong></p>
 *     <md-popover></md-popover>
 *   </div>
 * </hljs>
 *
 * @param {number=} md-z-index The visual level that the popover will appear
 *     in comparison with the rest of the elements of the application. Defaults
 *     to `100`.
 * @param {boolean=} md-enabled Is the popover enabled? Value will enable or
 *     disable the configured `md-open-trigger`. Defaults to `true`.
 * @param {expression=} md-visible Boolean value bound to an expression of
 *     whether or not the popover is currently visible. Defaults to `false`.
 * @param {string=} md-popover-class Custom class to be applied to the popover.
 * @param {boolean=} md-animated Should the popover fade and scale in and out?
 *     Defaults to `true`.
 * @param {string=} md-open-trigger What should trigger the showing of the
 *     popover? Supports a space separated list of event names Defaults to
 *     `mouseenter touchstart focus`. Accepts:
 *
 *   - mouseenter
 *   - click
 *   - focus
 *   - touchstart
 * @param {string=} md-close-trigger What should trigger the hiding of the
 *     popover? Supports a space separated list of event names. Defaults to
 *     `mouseleave touchcancel blur`. Accepts:
 *
 *   - mouseleave
 *   - click
 *   - outsideClick
 *   - escapeKeyPress
 *   - blur
 *   - touchcancel
 * @param {number=} md-open-delay How many milliseconds to wait to show the
 *     popover after the user interacts with the parent element. Defaults to
 *     `0ms` on non-touch devices and `75ms` on touch.
 * @param {number=} md-close-delay How many milliseconds to wait to hide the
 *     popover after the user completes the necessary interaction. Defaults to
 *     `0ms`.
 * @param {string=} md-position The position of the popover relative to the
 *     parent element. Defaults to `top`. Accepts the following:
 *
 *   - `top` - Popover on top, horizontally centered on parent element.
 *   - `right` - Popover on right, vertically centered on parent element.
 *   - `bottom` - Popover on bottom, horizontally centered on parent element.
 *   - `left` - Popover on left, vertically centered on parent element.
 */


/*****************************************************************************
 *                       MdPopover Service Implementation                    *
 *****************************************************************************/


/**
 * A service that handles the configuration of the popover and its events and
 * watchers.
 * @method MdPopoverService
 * @param {!angular.Scope} $rootScope
 * @param {!angular.$injector} $injector
 * @final @constructor @ngInject
 */
function MdPopoverService($rootScope, $injector) {
  // Injected variables
  /** @private @const {!angular.Scope} */
  this._$rootScope = $rootScope;

  /** @private @const {!angular.$injector} */
  this._$injector = $injector;

  /** @private @const {!$mdPanel} */
  this._$mdPanel = $injector.get('$mdPanel');

  /** @private @const {!$mdUtil} */
  this._$mdUtil = $injector.get('$mdUtil');

  // Private variables
  /**
   * Default config options for the popover. Anything Angular related needs to
   * be done later.
   * @private {!Object}
   */
  this._defaultConfigOptions = {
    zIndex: 100,
    enabled: true,
    visible: false,
    animated: true,
    openTrigger: 'mouseenter touchstart focus',
    closeTrigger: 'mouseleave touchcancel blur',
    openDelay: 0,
    closeDelay: 0,
    positionPopover: 'top',
    positionTooltip: 'bottom'
  };

  /**
   * The possible positions of the popover. Each position is an object
   * containing an `x` and `y` reference to a `MdPanelPosition` API option.
   * @private {!Object}
   */
  this._positions = {
    'top': {
      x: this._$mdPanel.xPosition.CENTER,
      y: this._$mdPanel.yPosition.ABOVE
    },
    'right': {
      x: this._$mdPanel.xPosition.OFFSET_END,
      y: this._$mdPanel.yPosition.CENTER
    },
    'bottom': {
      x: this._$mdPanel.xPosition.CENTER,
      y: this._$mdPanel.yPosition.BELOW
    },
    'left': {
      x: this._$mdPanel.xPosition.OFFSET_START,
      y: this._$mdPanel.yPosition.CENTER
    }
  };

  /** @private @const {!angular.Scope|undefined} */
  this._scope;

  /** @private @const {!angular.JQLite|undefined} */
  this._element;

  /** @private @const {!Object|undefined} */
  this._attrs;

  /** @private @const {Boolean|undefined} */
  this._isTooltip;

  /** @private @const {!angular.JQLite|undefined} */
  this._parentElement;
}


/**
 * Creates the popover and assigns the creation result to a popover reference.
 * After creation, several popover functions are called.
 * @method create
 * @param {!angular.Scope} scope
 * @param {!angular.JQLite} element
 * @param {!Object} attrs
 * @return {!MdPopoverRef}
 */
MdPopoverService.prototype.create = function(scope, element, attrs) {
  this._element = element;
  this._attrs = attrs;
  this._isTooltip = this._element[0].nodeName === 'MD_TOOLTIP';
  this._scope = this._setDefaultScope(scope);
  this._parentElement = this._$mdUtil.getParentWithPointerEvents(this._element);

  this._element.detach();

  var popoverRef = new MdPopoverRef(this._scope, this._element, this._attrs,
      this._isTooltip, this._parentElement, this._positions, this._$injector);

  popoverRef
      .updatePosition()
      ._bindEvents()
      ._configureWatchers();

  return popoverRef;
};


/**
 * Sets the default configuration for the popover scope. Uses the scope from the
 * popover directive or creates a new child scope from $rootScope.
 * @method setDefaultScope
 * @param {!angular.Scope} scope The scope from the popover directive.
 * @returns {!angular.Scope} scope
 * @private
 */
MdPopoverService.prototype._setDefaultScope = function(scope) {
  scope = scope || this._$rootScope.$new();

  scope.mdZIndex = scope.mdZIndex || this._defaultConfigOptions.zIndex;
  scope.mdEnabled = scope.mdEnabled || this._defaultConfigOptions.enabled;
  scope.mdVisible = scope.mdVisible || this._defaultConfigOptions.visible;
  scope.mdAnimated = scope.mdAnimated || this._defaultConfigOptions.animated;
  scope.mdOpenTrigger = scope.mdOpenTrigger ||
      this._defaultConfigOptions.openTrigger;
  scope.mdCloseTrigger = scope.mdCloseTrigger ||
      this._defaultConfigOptions.closeTrigger;
  scope.mdOpenDelay = scope.mdOpenDelay || this._defaultConfigOptions.openDelay;
  scope.mdCloseDelay = scope.mdCloseDelay ||
      this._defaultConfigOptions.closeDelay;
  scope.mdPosition = !this._positions[scope.mdPosition] ?
      this._isTooltip ?
          this._defaultConfigOptions.positionTooltip :
          this._defaultConfigOptions.positionPopover :
      scope.mdPosition;

  return scope;
};


/*****************************************************************************
 *                     MdPopover Reference Implementation                    *
 *****************************************************************************/


/**
 * A reference to the created popover.
 * @param {!angular.Scope} scope
 * @param {!angular.JQLite} element
 * @param {!Object} attrs
 * @param {!Object} positions
 * @param {!angular.$injector} $injector
 * @param {Boolean} isTooltip
 * @final @constructor
 */
function MdPopoverRef(scope, element, attrs, isTooltip, parentElement,
    positions, $injector) {
  // Injected variables.
  /** @private @const {!angular.$window} */
  this._$window = $injector.get('$window');

  /** @private @const {!angular.$document} */
  this._$document = $injector.get('$document');

  /** @private @const {!angular.$timeout} */
  this._$timeout = $injector.get('$timeout');

  /** @private @const {!angular.$log} */
  this._$log = $injector.get('$log');

  /** @private @const {!Function} */
  this._$$rAF = $injector.get('$$rAF');

  /** @private @const {!angular.$interpolate} */
  this._$interpolate = $injector.get('$interpolate');

  /** @private @const {!$mdUtil} */
  this._$mdUtil = $injector.get('$mdUtil');

  /** @private @const {!$mdPanel} */
  this._$mdPanel = $injector.get('$mdPanel');

  /** @private @const {!$mdPopoverRegistry} */
  this._$mdPopoverRegistry = $injector.get('$mdPopoverRegistry');

  // Public variables.
  /** @type {!Object} */
  this.scope = scope;

  /** @type {!Object} */
  this.element = element;

  /** @type {!Object} */
  this.attrs = attrs;

  /** @type {!Object} */
  this.positions = positions;

  // Private variables.
  /**
   * Is the popover being created a tooltip?
   * @private {Boolean|undefined}
   */
  this._isTooltip = isTooltip;

  /**
   * The parent element of the popover.
   * @private {!angular.JQLite|undefined}
   */
  this._parentElement = parentElement;

  /**
   * Is the element focused when the blur event has been fired on the window?
   * @private {boolean|undefined}
   */
  this._elementFocusedOnWindowBlur;

  /**
   * Is the mouse event on the parent element active?
   * @private {boolean|undefined}
   */
  this._mouseActive;

  /**
   * Whether or not to auto hide the popover.
   * @private {boolean|undefined}
   */
  this._autoHide;

  /** @private {boolean|undfined} */
  this._positionClass;

  /** @private {string|undefined} */
  this._panelPosition;

  /** @private {!MdPanelRef|undefined} */
  this._panelRef;

  /** @private {!angular.JQLite|undefined} */
  this._panelEl;

  /** @private {string|undefined} */
  this._parentAriaLabel;
}


/**
 * Updates the position of the popover panel. The positionClass and MdPanel
 * position are configured using the current `scope.mdPosition`.
 * @param {!MdPopoverRef} popoverRef Reference to the popover that is needed for
 *     event handlers to have access.
 * @return {!MdPopoverRef}
 */
MdPopoverRef.prototype.updatePosition = function(popoverRef) {
  var self = this || popoverRef;

  // If the panel has already been created, remove the current positionClass
  // class from the panel element.
  if (self._panelRef && self._panelRef.panelEl) {
    self._panelRef.panelEl.removeClass(self._positionClass);
  }

  // Set the panel element positionClass class based off of the current
  // `scope.mdPosition`.
  self._positionClass = 'md-position-' + self.scope.mdPosition;

  // Create the position of the panel based off of the current
  // `scope.mdPosition`.
  var position = self.positions[self.scope.mdPosition];

  // Using the newly created position object, use the MdPanel `panelPosition`
  // API to build the panel's position.
  self._panelPosition = self._$mdPanel.newPanelPosition()
      .relativeTo(self._parentElement)
      .addPanelPosition(position.x, position.y);

  // If the panel has already been created, add the new `_positionClass` class
  // to the panel element and update it's position with the `panelPosition`.
  if (self._panelRef && self._panelRef.panelEl) {
    self._panelRef.panelEl.addClass(self._positionClass);
    self._panelRef.updatePosition(self._panelPosition);
  }

  return self;
};


/**
 * Binds all of the events to the parentElement necessary to show and hide the
 * popover.
 * @method bindEvents
 * @return {!MdPanelRef}
 * @private
 */
MdPopoverRef.prototype._bindEvents = function() {
  var self = this;

  var attributeObserver;
  var debouncedOnResizeEventHandler = this._$$rAF.throttle(self.updatePosition);

  // Add a mutationObserver where there is support for it and the need for it in
  // the form of viable host(parentElement[0]).
  if (this._parentElement[0] && 'MutationObserver' in this._$window) {
    attributeObserver = new MutationObserver(function(mutations) {
      if (isDisabledMutation(mutations)) {
        self._$mdUtil.nextTick(function() {
          self._setVisible(false);
        });
      }
    });

    attributeObserver.observe(this._parentElement[0], {
      attributes: true
    });
  }

  this._elementFocusedOnWindowBlur = false;

  this._$mdPopoverRegistry.register('scroll', windowScrollEventHandler, true);
  this._$mdPopoverRegistry.register('blur', windowBlurEventHandler);
  // this._$mdPopoverRegistry.register('resize', debouncedOnResizeEventHandler);

  // To avoid synthetic clicks, we listen for mousedown instead of click.
  this._parentElement.on('mousedown', parentElementMousedownEventHandler);
  this._parentElement.on(self.scope.mdOpenTrigger,
      parentElementOpenTriggerEventHandler);

  this.scope.$on('$destroy', this.scopeDestroyEventHandler);

  /**
   * Checks the mutation from the `MutationObserver` to see if it is a disabled
   * mutation.
   * @param {!Object} mutations
   * @return {Boolean}
   */
  function isDisabledMutation(mutations) {
    mutations.some(function(mutation) {
      return mutation.attributeName === 'disabled' &&
          self._parentElement[0].disabled;
    });
    return false;
  }

  /**
   * Handles the window scroll event. Hides the popover after scroll event is
   * fired.
   */
  function windowScrollEventHandler() {
    self._setVisible(false);
  }

  /**
   * Handles the window blur event. Sets the element focused on window blur.
   */
  function windowBlurEventHandler() {
    self._elementFocusedOnWindowBlur = self._$document.activeElement ===
        self._parentElement[0];
  }

  /**
   * Handles the parent element mouse down event. Sets mouse active.
   */
  function parentElementMousedownEventHandler() {
    self._mouseActive = true;
  }

  /**
   * Handles the scope destroy event. Deregisters events from the
   * `$mdPopoverRegistry`.
   */
  function scopeDestroyEventHandler() {
    self._$mdPopoverRegistry.deregister('scroll',
        windowScrollEventHandler, true);
    self._$mdPopoverRegistry.deregister('blur', windowBlurEventHandler);
    // self._$mdPopoverRegistry.deregister('resize', debouncedOnResizeEventHandler);

    self._parentElement
        .off(self.scope.mdOpenTrigger, parentElementMousedownEventHandler)
        .off(self.scope.mdCloseTrigger, parentElementCloseTriggerEventHandler)
        .off('mousedown', parentElementMousedownEventHandler);

    // Trigger the close event handler in case any of the popovers are still
    // open.
    parentElementCloseTriggerEventHandler();
    attributeObserver && attributeObserver.disconnect();
  }

  /**
   * Handles the events on the parent element that are supposed to open the
   * popover.
   * @param {!Event} $event
   */
  function parentElementOpenTriggerEventHandler($event) {
    // Prevent the popover from opening when the window is receiving focus.
    if ($event.type === 'focus' && self._elementFocusedOnWindowBlur) {
      self._elementFocusedOnWindowBlur = false;
    } else if (!self.scope.mdVisible) {
      self._parentElement.on(self.scope.mdCloseTrigger,
          parentElementCloseTriggerEventHandler);
      self._setVisible(true);

      // If the user is on a touch device, we should bind the tap away after
      // the touched in order to prevent the popover being removed immediately.
      if ($event.type === 'touchstart') {
        self._parentElement.one('touchend', function() {
          self._$mdUtil.nextText(function() {
            self._$document.one('touchend',
                parentElementCloseTriggerEventHandler);
          }, false);
        });
      }
    }
  }

  /**
   * Handles the events on the parent element that are supposed to close the
   * popover.
   */
  function parentElementCloseTriggerEventHandler() {
    self._autoHide = self.scope.hasOwnProperty('mdAutohide') ?
        self.scope.mdAutohide :
        self.attrs.hasOwnProperty('mdAutohide');

    if (self._autoHide || self._mouseActive ||
        self._$document[0].activeElement !== self._parentElement[0]) {
      // When a open timeout is currently in progress, then we have to cancel
      // it, otherwise the popover will remain showing without focus or hover.
      if (self.scope.openTimeout) {
        self._$timeout.cancel(self.scope.openTimeout);
        self._setVisible.queued = false;
        self.scope.openTimeout = null;
      }

      self._parentElement.off(self.scope.mdCloseTrigger,
          parentElementCloseTriggerEventHandler);
      self._parentElement.triggerHandler('blur');
      self._setVisible(false);
    }

    self._mouseActive = false;
  }

  return self;
};


/**
 * Configures all of the necessary watchers for the popover.
 * @method configureWatchers
 * @private
 */
MdPopoverRef.prototype._configureWatchers = function() {
  var self = this;

  var attributeObserver;

  if (this.element[0] && 'MutationObserver' in this._$window) {
    attributeObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'md-visible' &&
            !self.scope.visibleWatcher) {
          self.scope.visibleWatcher = self.scope.$watch('mdVisible',
              self._onVisibleChanged);
        }
      });
    });

    attributeObserver.observe(this.element[0], {
      attributes: true
    });

    // Build watcher only if mdVisible is being used.
    if (this.attrs.hasOwnProperty('mdVisible')) {
      this.scope.visibleWatcher = this.scope.$watch('mdVisible',
          this._onVisibleChanged);
    }
  } else {
    // MutationObserver not supported.
    this.scope.visibleWatcher = this.scope.$watch('mdVisible',
        this._onVisibleChanged);
  }

  // Position watcher.
  this.scope.positionWatcher = this.scope.$watch('mdPosition',
      this.updatePosition(this));

  // Clean up if the element or parent was removed via JQLite's .remove.
  // A couple of notes:
  //   - In these cases the scope might not have been destroyed, which
  //     is why we destroy it manually. An example of this can be having
  //     `md-visible="false"` and adding tooltips while they're
  //     invisible. If `md-visible` becomes true, at some point, you'd
  //     usually get a lot of tooltips.
  //   - We use `.one`, not `.on`, because this only needs to fire once.
  //     If we were using `.on`, it would get thrown into an infinite
  //     loop.
  //   - This kicks off the scope's `$destroy` event which finishes the
  //     cleanup.
  this.element.one('$destroy', onElementDestroy);
  this._parentElement.one('$destroy', onElementDestroy);

  this.scope.$on('$destroy', watcherScopeDestroyEventHandler);

  /**
   * Handles the element destroy event. Destroys the scope as a result.
   */
  function onElementDestroy() {
    self.scope.$destroy();
  };

  /**
   * Handles the scope destroy event from the watchers configuration.
   */
  function watcherScopeDestroyEventHandler() {
    self._setVisible(false);
    self.element.remove();
    attributeObserver && attributeObserver.disconnect();
    self.scope.visibleWatcher && self.scope.visibleWatcher();
    self.scope.positionWatcher && self.scope.positionWatcher();
  };

  return self;
};


/**
 * Sets the popover to visible or not.
 * @method setVisible
 * @param {Boolean} visible Whether or not to open or close the popover.
 * @private
 */
MdPopoverRef.prototype._setVisible = function(visible) {
  var self = this;

  // Break if passed visible value is already in queue or there is no queue and
  // passed visible value is current in the controller.
  if (self._setVisible.queued && self._setVisible.value === !!visible ||
      !self._setVisible.queued && self.scope.mdVisible === !!visible) {
    return;
  }
  self._setVisible.value = !!visible;

  if (!self._setVisible.queued) {
    if (visible) {
      self._setVisible.queued = true;
      self.scope.openTimeout = self._$timeout(function() {
        self.scope.mdVisible = self._setVisible.value;
        self._setVisible.queued = false;
        self.scope.openTimeout = null;
        if (!self.scope.visibleWatcher) {
          self._onVisibleChanged(self.scope.mdVisible);
        }
      }, self.scope.mdOpenDelay);
    } else {
      self.scope.closeTimeout = self._$timeout(function() {
        self.scope.mdVisible = self._setVisible.value;
        self.scope.closeTimeout = null;
        if (!self.scope.visibleWatcher) {
          self._onVisibleChanged(self.scope.mdVisible);
        }
      }, self.scope.mdCloseDelay);
    }
  }
};


/**
 * Handles popover visiblility changes.
 * @param {Boolean} isVisible Visible opens the popover, not visible closes the
 *     popover.
 * @private
 */
MdPopoverRef.prototype._onVisibleChanged = function(isVisible) {
  isVisible ? this._open() : this._close();
};


/**
 * Configures the `_panelRef` with the `$mdPanel` API and then calls open.
 * @private
 */
MdPopoverRef.prototype._open = function() {
  var self = this;

  // If this is a tooltip, do not open it if the tooltip's text is empty.
  if (this._isTooltip && !this.element[0].textContent.trim()) {
    throw new Error('mdTooltip: Text for the tooltip has not been provided. ' +
        'Please include text within the mdTooltip element.');
  }

  this._buildPanelRef();
  this._addAriaLabelToParent();

  this._panelRef.open().then(function() {
    self._panelRef.panelEl.attr('role',
        !self._isTooltip ? 'popover' : 'tooltip');
  });
};


/**
 * Builds the panel ref based off the scope configuration and whether or not it
 * is a tooltip.
 */
MdPopoverRef.prototype._buildPanelRef = function() {
  var self = this;

  var id, attachTo, panelClass, panelAnimation, panelConfig,
      contentEl;

  if (!this._panelRef) {
    id = !this._isTooltip ? 'popover-' : 'tooltip-';
    id += this._$mdUtil.nextUid();

    attachTo = angular.element(document.body);

    panelClass = !this._isTooltip ? 'md-popover ' : 'md-tooltip ';
    panelClass += this._positionClass;

    panelAnimation = this._$mdPanel.newPanelAnimation()
        .openFrom(this._parentElement)
        .closeTo(this._parentElement)
        .withAnimation({
          open: 'md-show',
          close: 'md-hide'
        });

    panelConfig = {
      id: id,
      attachTo: attachTo,
      propagateContainerEvents: true,
      panelClass: panelClass,
      animation: panelAnimation,
      position: this._panelPosition,
      zIndex: this.scope.mdZIndex,
      focusOnOpen: false
    };

    if (this._isTooltip) {
      panelConfig.template = this.element.html().trim();

      this._parentAriaLabel = this.element.html().trim();
    } else {
      contentEl = angular.element('<md-panel></md-panel>');
      var children = this.element.children();
      angular.forEach(children, function(child) {
        child = angular.element(child);
        contentEl.append(child);
      });
      panelConfig.contentElement = contentEl;
    }

    this._panelRef = this._$mdPanel.create(panelConfig);
  }
};


/**
 * Sets the aria label of the parent element.
 * @param {string} override
 */
MdPopoverRef.prototype._addAriaLabelToParent = function(override) {
  if (!this._isTooltip && !this._parentElement.attr('aria-label')) {
    throw new Error('mdPopover: The popover\'s parent element is required to ' +
        'have an aria-label.');
  } else if (override || !this._parentElement.attr('aria-label')) {
    var rawText = override || this._parentAriaLabel;
    var interpolatedText = this._$interpolate(rawText)(this.scope);
    this._parentElement.attr('aria-label', interpolatedText);
  }
};


/**
 * Verifies that the `_panelRef` exists and if it does, it closes it.
 * @private
 */
MdPopoverRef.prototype._close = function() {
  this._panelRef && this._panelRef.hide();
};


/*****************************************************************************
 *                  MdPopover Registry Service Implementation                *
 *****************************************************************************/


/**
 * Service that reduces the amount of listeners that are being registered by the
 * popover.
 * @param {!angular.$injector} $injector
 * @final @constructor @ngInject
 */
function MdPopoverRegistryService($injector) {
  // Injected variables.
  /** @private {!angular.JQLite} */
  var _$window = $injector.get('$window');

  // Private variables.
  /** @private {!angular.JQLite} */
  var _ngWindow = angular.element(window);

  /** @private {!Object} */
  var _listeners = {};

  return {
    register: register,
    deregister: deregister
  };

  /**
   * Global event handler that dispatches the registered handlers in the service.
   * @method globalEventHandler
   * @param {!Event} event Event object passed in by the browser.
   */
  function globalEventHandler(event) {
    if (_listeners[event.type]) {
      _listeners[event.type].forEach(function(currentHandler) {
        currentHandler.call(this, event);
      }, this);
    }
  }

  /**
   * Registers a new handler with the MdPopoverRegistryService.
   * @method register
   * @param {string} type Type of event to be registered.
   * @param {!Function} handler Event handler function.
   * @param {boolean} useCapture Whether or not to use event capturing.
   */
  function register(type, handler, useCapture) {
    var handlers = _listeners[type] = _listeners[type] || [];

    if (!handlers.length) {
      useCapture ?
          _$window.addEventListener(type, globalEventHandler, true) :
          _ngWindow.on(type, this.globalEventHandler);
    }

    if (handlers.indexOf(handler) === -1) {
      handlers.push(handler);
    }
  }

  /**
   * Removes an event handler from the MdPopoverRegistryService.
   * @method deregister
   * @param {string} type Type of event handler.
   * @param {!Function} handler The event handler itself.
   * @param {boolean} useCapture Whether or not the event handler used event
   *     capturing.
   */
  function deregister(type, handler, useCapture) {
    var handlers = _listeners[type];
    var index = handlers ? handlers.indexOf(handler) : -1;

    if (index > -1) {
      handlers.splice(index, 1);

      if (handlers.length === 0) {
        useCapture ?
            _$window.removeEventListener(type, globalEventHandler, true) :
            _ngWindow.off(type, globalEventHandler);
      }
    }
  }
}


/*****************************************************************************
 *                      MdPopover Directive Implementation                   *
 *****************************************************************************/


/**
 * A directive that handles the displaying of the popover on the screen.
 * @method MdPopoverDirective
 * @param {!$mdPopover} $mdPopover
 * @final @constructor
 */
function MdPopoverDirective($mdPopover) {
  return {
    restrict: 'E',
    priority: 210, // Before ngAria
    scope: {
      mdZIndex: '@?',
      mdEnabled: '=?',
      mdVisible: '@?',
      mdPopoverClass: '@?',
      mdAnimated: '=?',
      mdOpenTrigger: '@?',
      mdCloseTrigger: '@?',
      mdOpenDelay: '@?',
      mdCloseDelay: '@?',
      mdPosition: '@?'
    },
    link: linkFunc
  };

  function linkFunc(scope, element, attrs) {
    var popoverRef = $mdPopover.create(scope, element, attrs);
  }
}
