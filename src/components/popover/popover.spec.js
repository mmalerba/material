describe('MdPopover Component', function() {
  var $compile, $rootScope, $material, $timeout, $mdPopover, $mdPopoverRegistry;
  var popoverRef;

  var injectLocals = function($injector) {
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    $material = $injector.get('$material');
    $timeout = $injector.get('$timeout');
    $window = $injector.get('$window');
    $mdPopover = $injector.get('$mdPopover');
    $mdPopoverRegistry = $injector.get('$mdPopoverRegistry');
  };

  beforeEach(function() {
    module(
      'material.components.popover',
      'material.components.button'
    );

    inject(injectLocals);
  });

  afterEach(function() {
    // Make sure to remove/cleanup after each test.
    popoverRef.remove();
    var scope = popoverRef && popoverRef.scope();
    scope && scope.$destroy;
    popoverRef = undefined;
  });



  // ******************************************************
  // Internal Utility methods
  // ******************************************************

  function buildPopover(markup) {
    popoverRef = $compile(markup)($rootScope);
    $rootScope.textModel = {};

    $rootScope.$apply();
    $material.flushOutstandingAnimations();

    return popoverRef;
  }

  function showPopover(isVisible) {
    if (angular.isUndefined(isVisible)) {
      isVisible = true;
    }

    $rootScope.testModel.isVisible = !!isVisible;
    $rootScope.$apply();
    $material.flushOutstandingAnimations();
  }

  function findPopover() {
    return angular.popoverRef(document.querySelector('.md-panel'));
  }

  function triggerEvent(eventType, skipFlush) {
    angular.forEach(eventType.split(','), function(name) {
      popoverRef.triggerHandler(name);
    });
    !skipFlush && $timeout.flush();
  }
});
