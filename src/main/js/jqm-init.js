/*global define,window */
define([ "jquery" ], function(jQuery) {
  window.console.log(jQuery);
  jQuery(document).bind("mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    jQuery.support.cors = true;
    jQuery.mobile.allowCrossDomainPages = true;
  });
});
