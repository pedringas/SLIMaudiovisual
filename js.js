// utility functions
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// File#: _2_off-canvas-navigation
// Usage: codyhouse.co/license
(function() {
  var OffCanvasNav = function(element) {
    this.element = element;
    this.panel = this.element.getElementsByClassName('js-off-canvas__panel')[0];
    this.trigger = document.querySelectorAll('[aria-controls="'+this.panel.getAttribute('id')+'"]')[0];
    this.svgAnim = this.trigger.getElementsByTagName('circle');
    initOffCanvasNav(this);
  };

  function initOffCanvasNav(canvas) {
    if(transitionSupported) {
      // do not allow click on menu icon while the navigation is animating
      canvas.trigger.addEventListener('click', function(event){
        canvas.trigger.style.setProperty('pointer-events', 'none');
      });
      canvas.panel.addEventListener('openPanel', function(event){
        canvas.trigger.style.setProperty('pointer-events', 'none');
      });
      canvas.panel.addEventListener('transitionend', function(event){
        if(event.propertyName == 'visibility') {
          canvas.trigger.style.setProperty('pointer-events', '');
        }
      });
    }

    if(canvas.svgAnim.length > 0) { // create the circle fill-in effect
      var circumference = (2*Math.PI*canvas.svgAnim[0].getAttribute('r')).toFixed(2);
      canvas.svgAnim[0].setAttribute('stroke-dashoffset', circumference);
      canvas.svgAnim[0].setAttribute('stroke-dasharray', circumference);
      Util.addClass(canvas.trigger, 'offnav-control--ready-to-animate');
    }
    
    canvas.panel.addEventListener('closePanel', function(event){
      // if the navigation is closed using keyboard or a11y close btn -> change trigger icon appearance (from arrow to menu icon) 
      if(event.detail == 'key' || event.detail == 'close-btn') {
        canvas.trigger.click();
      }
    });
  };

  // init OffCanvasNav objects
  var offCanvasNav = document.getElementsByClassName('js-off-canvas--nav'),
    transitionSupported = Util.cssSupports('transition');
  if( offCanvasNav.length > 0 ) {
    for( var i = 0; i < offCanvasNav.length; i++) {
      (function(i){new OffCanvasNav(offCanvasNav[i]);})(i);
    }
  }
}());

// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// File#: _1_off-canvas-content
// Usage: codyhouse.co/license
(function() {
  var OffCanvas = function(element) {
    this.element = element;
    this.wrapper = document.getElementsByClassName('js-off-canvas')[0];
    this.main = document.getElementsByClassName('off-canvas__main')[0];
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.closeBtn = this.element.getElementsByClassName('js-off-canvas__close-btn');
    this.selectedTrigger = false;
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.animating = false;
    initOffCanvas(this);
  };	

  function initOffCanvas(panel) {
    panel.element.setAttribute('aria-hidden', 'true');
    for(var i = 0 ; i < panel.triggers.length; i++) { // listen to the click on off-canvas content triggers
      panel.triggers[i].addEventListener('click', function(event){
        panel.selectedTrigger = event.currentTarget;
        event.preventDefault();
        togglePanel(panel);
      });
    }

    // listen to the triggerOpenPanel event -> open panel without a trigger button
    panel.element.addEventListener('triggerOpenPanel', function(event){
      if(event.detail) panel.selectedTrigger = event.detail;
      openPanel(panel);
    });
    // listen to the triggerClosePanel event -> open panel without a trigger button
    panel.element.addEventListener('triggerClosePanel', function(event){
      closePanel(panel);
    });
  };

  function togglePanel(panel) {
    var status = (panel.element.getAttribute('aria-hidden') == 'true') ? 'close' : 'open';
    if(status == 'close') openPanel(panel);
    else closePanel(panel);
  };

  function openPanel(panel) {
    if(panel.animating) return; // already animating
    emitPanelEvents(panel, 'openPanel', '');
    panel.animating = true;
    panel.element.setAttribute('aria-hidden', 'false');
    Util.addClass(panel.wrapper, 'off-canvas--visible');
    getFocusableElements(panel);
    var transitionEl = panel.element;
    if(panel.closeBtn.length > 0 && !Util.hasClass(panel.closeBtn[0], 'js-off-canvas__a11y-close-btn')) transitionEl = 	panel.closeBtn[0];
    transitionEl.addEventListener('transitionend', function cb(){
      // wait for the end of transition to move focus and update the animating property
      panel.animating = false;
      Util.moveFocus(panel.element);
      transitionEl.removeEventListener('transitionend', cb);
    });
    if(!transitionSupported) panel.animating = false;
    initPanelEvents(panel);
  };

  function closePanel(panel, bool) {
    if(panel.animating) return;
    panel.animating = true;
    panel.element.setAttribute('aria-hidden', 'true');
    Util.removeClass(panel.wrapper, 'off-canvas--visible');
    panel.main.addEventListener('transitionend', function cb(){
      panel.animating = false;
      if(panel.selectedTrigger) panel.selectedTrigger.focus();
      setTimeout(function(){panel.selectedTrigger = false;}, 10);
      panel.main.removeEventListener('transitionend', cb);
    });
    if(!transitionSupported) panel.animating = false;
    cancelPanelEvents(panel);
    emitPanelEvents(panel, 'closePanel', bool);
  };

  function initPanelEvents(panel) { //add event listeners
    panel.element.addEventListener('keydown', handleEvent.bind(panel));
    panel.element.addEventListener('click', handleEvent.bind(panel));
  };

  function cancelPanelEvents(panel) { //remove event listeners
    panel.element.removeEventListener('keydown', handleEvent.bind(panel));
    panel.element.removeEventListener('click', handleEvent.bind(panel));
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'keydown':
        initKeyDown(this, event);
        break;
      case 'click':
        initClick(this, event);
        break;
    }
  };

  function initClick(panel, event) { // close panel when clicking on close button
    if( !event.target.closest('.js-off-canvas__close-btn')) return;
    event.preventDefault();
    closePanel(panel, 'close-btn');
  };

  function initKeyDown(panel, event) {
    if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
      //close off-canvas panel on esc
      closePanel(panel, 'key');
    } else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
      //trap focus inside panel
      trapFocus(panel, event);
    }
  };

  function trapFocus(panel, event) {
    if( panel.firstFocusable == document.activeElement && event.shiftKey) {
      //on Shift+Tab -> focus last focusable element when focus moves out of panel
      event.preventDefault();
      panel.lastFocusable.focus();
    }
    if( panel.lastFocusable == document.activeElement && !event.shiftKey) {
      //on Tab -> focus first focusable element when focus moves out of panel
      event.preventDefault();
      panel.firstFocusable.focus();
    }
  };

  function getFocusableElements(panel) { //get all focusable elements inside the off-canvas content
    var allFocusable = panel.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
    getFirstVisible(panel, allFocusable);
    getLastVisible(panel, allFocusable);
  };

  function getFirstVisible(panel, elements) { //get first visible focusable element inside the off-canvas content
    for(var i = 0; i < elements.length; i++) {
      if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
        panel.firstFocusable = elements[i];
        return true;
      }
    }
  };

  function getLastVisible(panel, elements) { //get last visible focusable element inside the off-canvas content
    for(var i = elements.length - 1; i >= 0; i--) {
      if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
        panel.lastFocusable = elements[i];
        return true;
      }
    }
  };

  function emitPanelEvents(panel, eventName, target) { // emit custom event
    var event = new CustomEvent(eventName, {detail: target});
    panel.element.dispatchEvent(event);
  };

  //initialize the OffCanvas objects
  var offCanvas = document.getElementsByClassName('js-off-canvas__panel'),
    transitionSupported = Util.cssSupports('transition');
  if( offCanvas.length > 0 ) {
    for( var i = 0; i < offCanvas.length; i++) {
      (function(i){new OffCanvas(offCanvas[i]);})(i);
    }
  }
}());

// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
  var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
  if( menuBtns.length > 0 ) {
    for(var i = 0; i < menuBtns.length; i++) {(function(i){
      initMenuBtn(menuBtns[i]);
    })(i);}

    function initMenuBtn(btn) {
      btn.addEventListener('click', function(event){	
        event.preventDefault();
        var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
        Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
        // emit custom event
        var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
        btn.dispatchEvent(event);
      });
    };
  }
}());