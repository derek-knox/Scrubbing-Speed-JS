
var ScrubbingSpeed = (function() {
  
  /******************************************************************
  Cache
  ******************************************************************/

  var $speedOverlay = document.createElement('div'),
      $documentOverlay = document.createElement('div'),
      scrubbers = [],
      SUPPORTS_TOUCH = "ontouchstart" in window,
      api = {
        init: init
      };

  $speedOverlay.id = 'speed-overlay';
  $documentOverlay.id= 'document-overlay';

  /******************************************************************
  API
  ******************************************************************/

  function init(name, callback, speedsOverride) {
    
    //safeguard
    var invalid = false;
    for(var i = 0, len = scrubbers.length; i < len; i++) {
      if(scrubbers[i].name === name) { invalid = true; return; }
    }

    //exit condition
    if(invalid) return;

    //init
    scrubbers.push(new Scrubber(name, callback, speedsOverride));
  }

  return api;

  /******************************************************************
  Scrubber Class
  ******************************************************************/

  function Scrubber(name, callback, speedsOverride) {

    //cache
    var ss = getElementsByAttribute(document, 'div', 'data-ss-name', name),
        $ss = ss[0],
        $fillTrack = document.createElement('div'),
        $fill = document.createElement('div'),
        $knob = document.createElement('div'),
        $arrow = document.createElement('div'),

        //colors
        colorFill = $ss.getAttribute('data-ss-color-fill'),
        colorEmpty = $ss.getAttribute('data-ss-color-empty'),

        //scrub position
        origPos,
        prevPos,
        currPos,
        lockPos,

        //scrub exposable
        minAmount = $ss.getAttribute('data-ss-min'),
        maxAmount = $ss.getAttribute('data-ss-max'),
        currAmount,
        percentX, 
        percentY,

        //knob and track
        knobWidth,
        knobHeight,
        minTrack,
        maxTrack,

        //offsets
        offsetScrubX,
        offsetScrubY,
        offsetHorizontal,
        offsetVertical,
        isPlaceAbove,

        //view settings
        speedLabelMargin = 5,
        screenSpeedTriggerPercentage = .1,
        defaultTransparency = .3,

        //speed settings
        speeds = speedsOverride || [{ speed: 1, label: 'Normal' }, { speed: .01, label: 'Precise' }],
        speed = speeds[0].speed,

        //public hooks
        updateCallback = callback,
        returnSettings = { 
          min: Number(minAmount),
          current: currAmount,
          max: Number(maxAmount),
          speed: speed,
          percentX: percentX,
          percentY: percentY
        };

    //init
    (function(){

      //track
      $fillTrack.id = name + '-fill-track';
      addClass($fillTrack, 'fill-track');
      $fillTrack.style.backgroundColor = colorEmpty;

      //fill
      $fill.id = name + '-fill'
      addClass($fill, 'fill');
      $fill.style.backgroundColor = colorFill;

      //knob
      $knob.id = name + '-knob'
      addClass($knob, 'knob');
      $knob.style.backgroundColor = colorFill;

      //arrow
      $arrow.id = name + '-arrow'
      addClass($arrow, 'arrow');
      $arrow.style.color = colorFill;

      //view update
      $ss.appendChild($fillTrack);
      $ss.appendChild($fill);
      $ss.appendChild($knob);
      $knob.appendChild($arrow);
      $fillTrack.style.width = getComputedStyle($ss)['width'];

      //init interactivity
      $knob.addEventListener(SUPPORTS_TOUCH ? 'touchstart' : 'mousedown', onDown);
    }());

    /******************************************************************
    Methods
    ******************************************************************/

    function updateHelpers(e) {
      
      //normalize event
      e = SUPPORTS_TOUCH ? e.originalEvent.touches[0] : e;
      
      //event input related values
      var offsetX, offsetY,
          x = e.clientX,
          y = e.clientY;
      
      //offsets
      var parentOffsetDiffX = $ss.getBoundingClientRect().left - $ss.parentNode.getBoundingClientRect().left; //scrubbing-speed-wrapper parent
      offsetX = $ss.getBoundingClientRect().left - parentOffsetDiffX - document.body.getBoundingClientRect().left;
      offsetY = e.offsetY || e.layerY;

      //scrub offset x helper
      knobWidth = getComputedStyle($knob)['width'].replace('px', '');
      var knobWidthHalved = knobWidth * .5,
          offsetDist = Math.abs(offsetX - knobWidthHalved),
          offset = offsetX >= knobWidthHalved ? -offsetDist : offsetDist; 
      offsetScrubX = offset - knobWidth;
      
      //scrub offset y helper
      var knobHeightHalved = getComputedStyle($knob)['height'].replace('px', '') * .5;
      offsetDist = Math.abs(offsetY - knobHeightHalved);
      offset = offsetY >= knobHeightHalved ? -offsetDist : offsetDist;
      offsetScrubY = -knobHeightHalved + offset;

      //core track and position helper
      minTrack = $ss.offsetLeft;
      maxTrack = minTrack + Number(getComputedStyle($ss)['width'].replace('px', ''));
      origPos = { x: x, y: y + offsetScrubY };
      isPlaceAbove = false; // isPlaceAbove = y > window.innerHeight * .5;
    }
    
    function updateZones() {
      
      //helpers
      var i,
          len = speeds.length,
          speedZoneHeight = window.innerHeight * screenSpeedTriggerPercentage,
          width = $fillTrack.style.width,
          height = speedZoneHeight * len,
          top = $knob.getBoundingClientRect().top - document.body.getBoundingClientRect().top + document.documentElement.offsetTop, //safeguard if <html> element has margin
          left = $fillTrack.getBoundingClientRect().left,
          el,
          val;

      //css
      $speedOverlay.innerHTML = '';
      $speedOverlay.style.width = width + 'px';
      $speedOverlay.style.height = height + 'px';
      $speedOverlay.style.top = top + 'px';
      $speedOverlay.style.left = left + 'px';
      $speedOverlay.style.opacity = defaultTransparency;

      //layout
      for(i = 0; i < len; i++) {
        val = speeds[i].label;
        el = document.createElement('div');
        addClass(el, 'speed-zone');
        el.id = 'speedZone' + i;
        el.style.width = getComputedStyle($fillTrack)['width'];
        el.style.height = speedZoneHeight + 'px';
        el.style.color = colorFill;
        el.innerHTML = (i !== 0 ? '<div class="speed-label">' + val + '</div>' : '');
        $speedOverlay.appendChild(el);
      }

      //setTimeout to give browser time to render, now we can get clientHeight
      setTimeout(function() {

        //update label offsets
        var labelHeight = $speedOverlay.querySelectorAll('.speed-label')[0].clientHeight,
            targHeight = isPlaceAbove ? speedZoneHeight - labelHeight - speedLabelMargin : speedLabelMargin,
            labels = $speedOverlay.querySelectorAll('.speed-label');
        for(i = 0, len = labels.length; i < len; i++) {
          labels[i].style.margin = targHeight + 'px 0';
        }
        
        //above/below
        if(isPlaceAbove) {

          //reverse view order
          var items = Array.prototype.slice.call($speedOverlay.children, 0).reverse();
          $speedOverlay.innerHTML = '';
          for(i = 0, len = items.length; i < len; i++) {
            $speedOverlay.appendChild(items[i]);
          }
          $speedOverlay.style.top = top - (speeds.length * speedZoneHeight) + 'px'; 
        }

      }, 1);
    }
    
    function updateGrab(isGrabbing) {

      //overlays
      if(isGrabbing) {

        //selection helper
        addClass(document.body, 'no-select');

        //overlay insertion
        document.body.insertBefore($documentOverlay, document.body.firstChild);
        document.body.insertBefore($speedOverlay, document.body.firstChild);

        //value updates
        $documentOverlay.style.height = document.body.clientHeight;
        addClass($arrow, 'arrow-move');
      } else {

        //selection helper clean
        removeClass(document.body, 'no-select');

        //overlay removal
        $speedOverlay.parentNode.removeChild($speedOverlay);
        $documentOverlay.parentNode.removeChild($documentOverlay);

        //value updates
        $speedOverlay.style.opacity = 0;
        speed = speeds[0].speed; //reset
        removeClass($arrow, 'arrow-move');
      }
    }
    
    function updateSpeed() {
      
      //calc
      offsetVertical = Math.abs(origPos.y - currPos.y);
      percentY = map(offsetVertical/$speedOverlay.style.height.replace('px', ''), 0, window.innerHeight, 0, $speedOverlay.style.height.replace('px', ''));
          
      //speed index and invalidation check
      var index = clamp(Math.floor(percentY/screenSpeedTriggerPercentage), 0, speeds.length - 1),
          invalidated = isMovementInvalidated();
      
      //update
      if(speed !== speeds[index].speed && !invalidated) {
        lockPos = { x: parseInt($knob.style.left.replace('px', '')), y: currPos.y };
        speed = speeds[index].speed;
      }
    }

    function isMovementInvalidated() {
      return (isPlaceAbove && currPos.y > origPos.y) || (!isPlaceAbove && currPos.y < origPos.y);
    }
    
    /******************************************************************
    Handlers
    ******************************************************************/

    function onDown(e) {
      updateHelpers(e);
      updateZones();
      updateGrab(true);
      window.addEventListener(SUPPORTS_TOUCH ? 'touchmove' : 'mousemove', onMove);
      window.addEventListener(SUPPORTS_TOUCH ? 'touchend' : 'mouseup', onUp);
    }

    function onUp(e) {
      updateGrab(false);
      window.removeEventListener(SUPPORTS_TOUCH ? 'touchmove' : 'mousemove', onMove);
      window.removeEventListener(SUPPORTS_TOUCH ? 'touchend' : 'mouseup', onUp);
    }
    
    function onMove(e) {

      //normalize event
      e = SUPPORTS_TOUCH ? e.originalEvent.touches[0] : e;
      
      //pos
      prevPos = currPos ? { x: currPos.x, y: currPos.y } : origPos;
      currPos = { x: e.clientX + offsetScrubX, y: e.clientY }; 
      offsetHorizontal = lockPos ? currPos.x - lockPos.x : currPos.x - prevPos.x;

      //speed
      updateSpeed();
              
      //vals
      var newX = lockPos ? lockPos.x + offsetHorizontal * speed : currPos.x,
      currAmount = map(newX, minTrack, maxTrack - knobWidth, minAmount, maxAmount);

      //percent rounding
      percentX = roundToDecimal(normalize(newX, minTrack, maxTrack - knobWidth), 2);
      percentY = roundToDecimal(percentY, 2);
      
      //view update
      $fill.style.width = clamp(percentX * getComputedStyle($ss)['width'].replace('px', ''), 0, getComputedStyle($ss)['width'].replace('px', '')) + 'px';
      $knob.style.left = clamp(newX, minTrack, maxTrack - getComputedStyle($knob)['width'].replace('px', '')) + 'px';
      $speedOverlay.style.opacity = !isMovementInvalidated() ? clamp(percentY/screenSpeedTriggerPercentage, defaultTransparency, 1) : defaultTransparency;

      //expose update
      returnSettings.current = clamp(currAmount, minAmount, maxAmount);
      returnSettings.speed = speed;
      returnSettings.percentX = clamp(percentX * 100, 0, 100);
      returnSettings.percentY = clamp(percentY * 100, 0, 100);

      //expose
      updateCallback(returnSettings);
    }
  }

  /******************************************************************
  Helper Methods (via Coding Math YouTube channel by Keith Peters)
  ******************************************************************/

  function normalize(value, min, max) {
    return (value - min) / (max - min);
  }
  
  function lerp(norm, min, max) {
    return (max - min) * norm + min;
  }
  
  function map(value, srcMin, srcMax, destMin, destMax) {
    return lerp(normalize(value, srcMin, srcMax), destMin, destMax);
  }
  
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  function roundToDecimal(value, decimals) {
  	decimals = isNaN(decimals) ? 0 : decimals;
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  }

  /******************************************************************
  Helper Methods (via http://snipplr.com/view/1853/get-elements-by-attribute/)
  ******************************************************************/

  function getElementsByAttribute(oElm, strTagName, strAttributeName, strAttributeValue){
    var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    var oAttributeValue = (typeof strAttributeValue != "undefined")? new RegExp("(^|\\s)" + strAttributeValue + "(\\s|$)", "i") : null;
    var oCurrent;
    var oAttribute;
    for(var i=0; i<arrElements.length; i++){
        oCurrent = arrElements[i];
        oAttribute = oCurrent.getAttribute && oCurrent.getAttribute(strAttributeName);
        if(typeof oAttribute == "string" && oAttribute.length > 0){
            if(typeof strAttributeValue == "undefined" || (oAttributeValue && oAttributeValue.test(oAttribute))){
                arrReturnElements.push(oCurrent);
            }
        }
    }
    return arrReturnElements;
  }

  /******************************************************************
  Helper Methods (via http://youmightnotneedjquery.com/)
  ******************************************************************/

  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  }

  function removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  function outerHeight(el) {
    var height = el.offsetHeight;
    var style = getComputedStyle(el);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
  }
  
})();