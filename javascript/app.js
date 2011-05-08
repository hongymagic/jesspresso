/**
 * Amblique JavaScript Training Session
 *
 * Part 2
 *
 * @author    David G. Hong
 * @email     davidhong.code@gmail.com
 * @url       http://davidhong.co/
 */

//
// Contents (as requested by peers in Amblique)
//
//  jQuery
//    > Ajax
//    > Plugins
//    > Mobile support
//
//  JavaScript cross-browser supports
//    > JSON (use json2.js for IE)
//
//  Best Practices
//    > Dynamic nature of JavaScript
//    > 
//
//  Newbie friendly
//  Practical examples from projects
//  

window.log = function (){
  log.history = log.history || [];
  log.history.push(arguments);
  if (this.console){
    console.log(Array.prototype.slice.call(arguments));
  }
};

(function (window, end) {
  var document = window.document,
      $slide = $('#slide'),
      currentIndex = 0,
      arrows = {
        prev: 37,
        next: 39
      },
      loading = false,
      
      ANIM_DURATION = 150,
      
// Helper functions for slide controls
      
      indexWithInRange = function (index) {
        return 1 <= index && index <= end;
      };
      
  Sammy.log = function () { };

// Slides application

  var app = Sammy('#main', function () {
    this.debug = false;
    
    // slide indexing
    this.getIndex = function () {
      return currentIndex;
    };
  
    // slide routing
    this.get('#/slide/:index', function () { 
      loading = true;
             
      var index = this.params['index'] * 1,
          slide = 'slides/' + index + '.html';

      this
        .load(slide, { cache: false }, function (html) { 
          currentIndex = index;
          
          this.trigger('slide.loaded', { content: html });
        });
    });
    
    // application wide events
    this.bind('slide.before', function (ec) {
      log(this, arguments);
    });
    this.bind('slide.loaded', function (ec, data) {
      var self = this;
      $slide
        .fadeOut(ANIM_DURATION, function () {
          $slide
            .html(data.content)
            .fadeIn(ANIM_DURATION, function () {
              self.trigger('slide.complete');
            });
        });
    });
    this.bind('slide.complete', function (ec) {
      loading = false;
      
      if (typeof sh_highlightDocument == 'function') {
        sh_highlightDocument();
      }
    });
    
    this.bind('slide.next', function (ec) {
      var next = currentIndex + 1,
          valid = indexWithInRange(next) && !loading;
          
      valid && this.redirect('#/slide/' + next);
    });
    this.bind('slide.prev', function (ec) {
      var prev = currentIndex - 1,
          valid = indexWithInRange(prev) && !loading;

      valid && this.redirect('#/slide/' + prev);
    });
  });
  
// View logic

  $('body')
    .delegate('.prev', 'click', function (event) {
      event.preventDefault();
  
      app.trigger('slide.prev');
    })
    .delegate('.next', 'click', function (event) {
      event.preventDefault();

      app.trigger('slide.next');
    })
    .delegate('.run', 'click', function (event) {
      event.preventDefault();
      
      var rel = $(this).attr('rel'),
          code = $(rel).text();
      
      if (code) {
        eval(code);
      };
    });
  $(document).bind('keyup', function (event) {
      var keyCode = event.keyCode === 0 ? event.which : event.keyCode;
      
      if (keyCode == arrows.prev) {
        app.trigger('slide.prev');
      } else if (keyCode == arrows.next) {
        app.trigger('slide.next');
      }
    });
  
  return (window.app = app);
})(this, 3).run('#/slide/1'); // start the program