var CANVAS_MAIL = (function( $ ){
    var canvas_mail = {};

    // TODO Add any other mailto features like subject etc
    canvas_mail.render_email = function( elements, user, domain ) {  
	/* elements : Elements to clear and add a canvas email to
	   user     : email user name
	   domain   : email domain name
	*/

	elements.each(function() {
	    var $this = $(this);
	    
	    // TODO Get styles and update accordingly including pseudo
	    // selectors Clear at some point. Want to get text height if
	    // possible, but this also clears the link. Potentially add the
	    // link, get the styles, clear and read

	    // Read attributes of the element to duplicate style
	    var fontSize = parseInt($this.css("font-size"));
	    var fontFamily = $this.css("font-family");
	    var color = $this.css("color");
	    
	    var height = parseInt($this.css("height"))
	    if (height == 0) { // Empty line -> guess
		height = Math.floor(fontSize * 1.5)
	    }
	    // TODO does this work with em?
	    fontText = fontSize + "px " + fontFamily;
	    
	    // Get rendred text width
	    var testCtx = $("<canvas></canvas>")[0].getContext("2d");
	    testCtx.font = fontText;
	    var width = testCtx.measureText(user + "@" + domain).width;
	    
	    // Create proper sized canvas
	    var canvas = $("<canvas></canvas>");
	    canvas.attr({"width" : width, "height" : height});
	    canvas.css("vertical-align", "text-top");
	    
	    // Draw text on canvas
	    var ctx = canvas[0].getContext("2d");
	    ctx.font = fontText;
	    ctx.fillStyle = color;
	    ctx.textAlign = "left";
	    ctx.textBaseline = "top";
	    ctx.fillText(user + "@" + domain, 0, 0);
	    
	    $this.empty();
	    
	    if ($this.prop("tagName") == "A") {
		$this.attr({"onmouseover" : ("this.href='mailto:' + '" + user +
					     "' + '@' + '" + domain + "'"),
	    		    "onmouseout" : "this.href=null"});
	    }
	    $this.append(canvas);
	});
    };

    return canvas_mail;
})( jQuery );
