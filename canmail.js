(function( $ ){
    $.fn.canMail = function( user, domain, link ) {  
	// User   : email user name
	// Domain : email domain name
	// Link   : whether or not to add link to canvas

	return this.each(function() {
	    var $this = $(this);

	    // Read attributes of the element to duplicate style
	    var fontSize = parseInt($this.css("font-size"));
	    var fontFamily = $this.css("font-family");
	    var color = $this.css("color");
	    var height = parseInt($this.css("height"))
	    if (height == 0) { // Empty line
		height = Math.floor(fontSize * 1.5)
	    }
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

	    // Clear element
	    // Append canvas
	    // Add link if desired
	    $this.empty();
	    if (link) {
		var a = $("<a></a>");
		a.attr({"onmouseover" : "this.href='mailto:' + '" + user + "' + '@' + '" + domain + "'",
			"onmouseout" : "this.href=null"});
		a.append(canvas);
		$this.append(a);
	    } else {
		$this.append(canvas);
	    }
	});
    };
})( jQuery );
