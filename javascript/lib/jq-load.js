/**
 * jq-load
 * 
 * A simple jQuery loader to load required modules from the jQuery framework.
 * 
 * @example
 * <script src="/js/jq-load.js?modules=ajax,effects"></script>
 * <script type="text/javascript">
 * var tweets = $.ajax({ ... });
 */
 
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fun /*, thisp */) {
    "use strict";

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") {
      throw new TypeError();
    }

    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in t) {
        fun.call(thisp, t[i], i, t);
      }
    }
  };
}

// Let's do this without trashing the global object
(function (window) {
  "use strict";
  
  var document = window.document,
      console = window.console || undefined,
  
      // cache commonly used methods
      push = Array.prototype.push,
      slice = Array.prototype.slice,
      replace = String.prototype.replace,
      split = String.prototype.split,
      forEach = Array.prototype.forEach,
      
      // write to console
      log = window.log || function (){
        if (console) {
          console.log(slice.call(arguments));
        }
      },
      
      // load module (javascript file) into the document
      cdn = 'https://github.com/jquery/jquery/raw/master/src/',
      require = function (module) {
        var resource = cdn + module + '.js';
        try{
          // inserting via DOM fails in Safari 2.0, so brute force approach
          document.write('<script type="text/javascript" src="' + resource + '"><\/script>');
        } catch(e) {
          // for xhtml+xml served content, fall back to DOM methods
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = resource;
          document.getElementsByTagName('head')[0].appendChild(script);
        }
      },
  
      // pull jQuery modules as specified in the document via <script> tag
      js = /jq\-load\.js(\?.*)?$/,
      modules = function () {
        var nl = document.getElementsByTagName('script'),
            sl = [], ml = [];
            
        for (var i = 0, l = nl.length; i < l; i++) {
          var n = nl[i];
          if (n.attributes && n.attributes.src) {
            push.call(sl, n.attributes.src.value);
          }
        }
        
        forEach.call(sl, function (s) {
          var path = s.replace(js, ''),
              includes = s.match(/\?.*modules=([a-z,]*)/);
              
          forEach.call(split.call((includes ? includes[1] : 'core,deferred,support,data,queue,attributes,event,selector,traversing,manipulation,css,ajax,ajax/jsonp,ajax/script,ajax/xhr,effects,offset,dimensions'), ','), function (m) {
            push.call(ml, m);
            
            if (typeof require == 'function') {
              require.call(document, m);
            }
          });
        });
        
        return ml;
      }();
})(this);