/*global define */
define([ "jquery" ], function($) {
  $(document).bind("mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
  });
});
