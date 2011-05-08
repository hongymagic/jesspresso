/**
 * jesspresso
 * 
 * a light weight presentation framework
 *
 * @requires: jQuery, Sammy.js
 * [aim is to remove these dependencies]
 *
 * @author: David G. Hong
 * @email: davidhong.code@gmail.com
 * @url: http://davidhong.co
 */

/**
 * jesspresso
 * 
 * Sammy based jesspresso object
 *
 * @param: selector - main element for jesspresso presentation
 * @param: options - options for jesspresso
 * @returns: Sammy Application object
 */
window.jesspresso = (function (window) {
  var document = window,
      $ = window.jQuery,
      console = window.console,
      
      // cache commonly used protoype methods
      slice = Array.prototype.slice,
      
      // patterns for routing
      PATH_NAME_MATCHER = /:([\w\d]+)/g,
      PATH_REPLACER = "([^\/]+)",
      
      ANIMATION_DURATION = 250;
      
  // collection of helpful functions for general use
  var jesshelpers = {
    log: function () {
      if (console){
        console.log(slice.call(arguments));
      }
    },
    
    highlight: function () {
      if (typeof sh_highlightDocument == 'function') {
        sh_highlightDocument();
      }
    },
    
    validate_config: function (config) {
      if (!config) {
        return false;
      }
      
      var required = ['start', 'end', 'hash', 'route.value', 'route.path', 'filetype'];
      for (var i = 0, l = required.length; i < length; i++) {
        var type = typeof config[required[i]]
        if (type == 'undefined' || type == null) {
          return false;
        }
      }
      
      return true;
    },

    get_slide_route: function (config, index) {
      var path = config.route.value.replace(PATH_NAME_MATCHER, index);
      var slide_route = config.hash + path;
      return slide_route;
    },

    get_slide_path: function (config, index) {
      var path = config.route.path.replace(PATH_NAME_MATCHER, index);
      var slide_path = path + '.' + config.filetype;
      return slide_path;
    }
  };
  
  // return a new instance of the Sammy Application
  return function (selector, config) {
    // set defaults (TODO: please document)
    if (!jesshelpers.validate_config(config)) {
      throw 'Invalid config, please check the config argument';
    }
    
    var log = jesshelpers.log;

    var app = $.sammy(selector, function () {
      this.config = config;
      this.index = 0;
      this.loading = false;
      this.log = function () { };
      
      // reference to self
      var self = this;
      
      // events
      this
        .bind('slide.load', function (context, data) {          
          var $element = this.$element();
          $element
            .fadeOut(ANIMATION_DURATION, function () {
              $element.html(data.content);
              jesshelpers.highlight();
              
              $element.fadeIn(ANIMATION_DURATION, function () {
                self.trigger('slide.loaded');
              });
            });
        })
        .bind('slide.loaded', function (context, data) {          
          self.loading = false;
        })
        .bind('window.notify', function (context, text) {
          if (typeof config.notify == 'function') {
            config.notify.call(this, text);
          }
        })
        .bind('slide.goto', function (context, index) {
          if (!self.loading) {
            this.redirect(jesshelpers.get_slide_route(config, index));
          }
        })
        .bind('slide.prev', function (context) {
          self.index > 1 && (this.trigger('window.notify', '&larr;'), this.trigger('slide.goto', self.index - 1));
        })
        .bind('slide.next', function (context) {
          self.index < config.end && (this.trigger('window.notify', '&rarr;'), this.trigger('slide.goto', self.index + 1));
        });
      
      // slide routing
      this.get(config.hash + config.route.value, function () {
        self.loading = true;
        
        var index = this.params['index'] * 1,
            url = jesshelpers.get_slide_path(config, index);
        
        this.load(url, { cache: false }, function (html) {
          self.index = index;
          this.trigger('slide.load', { url: url, content: html });
        });
      });
    }).run(jesshelpers.get_slide_route(config, config.start));
    
    // slide wide user-events
    $(document)
      .bind('keydown', function (event) {
        var keyCode = event.keyCode === 0 ? event.which : event.keyCode;
  
        if (keyCode == 37) {
          presso.trigger('slide.prev');
        } else if (keyCode == 39) {
          presso.trigger('slide.next');
        }
      });
    
    return app;
  };
})(this);

//
// initialise the initial presentation
var $command_window = $('#command-window'),
    $command = $('#command-window #command'),
    BLINK_DURATION = 150;
    
var presso_config = {
  start: 1,
  end: 3,
  hash: '#!',
  route: {
    value: 'slides/:index',
    path: 'slides/:index'
  },
  filetype: 'html',
  notify: function (text) {
    $command.html(text);
    
    var queued = $command_window.queue('fx').length > 0;
    if (!queued) {
      $command_window.fadeIn(BLINK_DURATION, function () {
        $command_window.fadeOut(BLINK_DURATION * 0.4);
      });
    }
  }
}
var presso = jesspresso('#main', presso_config);

//
// bind window events to the presentation
$(function () {
  var $body = $('body');
  
  $body
    .delegate('.run', 'click', function (event) {
      event.preventDefault();

      var rel = $(this).attr('rel'),
          code = $(rel).text();

      if (code) {
        eval(code);
      };
    });
})
