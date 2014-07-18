var CANVAS_MAIL = (function( $ ){
    var canvas_mail = {};

    // TODO Add any other mailto features like subject etc
    canvas_mail.render_email = function( elements, user, domain ) {  
	/* elements : Elements to clear and add a canvas email to
	   user     : email user name
	   domain   : email domain name
	*/

	function measure_text( text, font ) {
	    var txt = $("<span></span>");
	    txt.text(text);
	    txt.css("font", font);
	    $(document.documentElement).append(txt);
	    var height = txt.height();
	    var width = txt.width();
	    txt.remove()
	    return {
		height: height,
		width: width
	    };
	}

	// TODO Allow manual specification of lineheight / thickness
	function render_text( text, font, font_size, color, decoration ) {
	    // Create canvas
	    var size = measure_text(text, font);
	    var canvas = $("<canvas></canvas>");
	    canvas.attr(size);
	    canvas.css("vertical-align", "text-top");

	    // Draw text on canvas
	    var ctx = canvas[0].getContext("2d");
	    ctx.font = font;
	    ctx.fillStyle = color;
	    ctx.textAlign = "left";
	    ctx.textBaseline = "top";
	    ctx.fillText(text, 0, 0);

	    // Draw decoration
	    arr = decoration.split(" ");
	    dec_type = arr.shift();
	    dec_style = arr.shift(); // Nonstandard, ignored
	    dec_color = arr.join(" "); // Nonstandard, ignored

	    // Switch on line height
	    var line_height = 0
	    switch (dec_type) {
		case "underline":
		    line_height = font_size;
		    break;
		case "overline":
		    break;
		case "line-through":
		    line_height = font_size / 2;
		case "none":
		default:
		    return canvas;
	    }
	    
	    // Draw actual line
	    ctx.beginPath();
	    ctx.strokeStyle = color;
	    ctx.lineWidth = 1;
	    ctx.moveTo(0, line_height);
	    ctx.lineTo(size.width, line_height);
	    ctx.stroke();
	    
	    return canvas;
	}

	elements.each(function() {
	    var $this = $(this);
	    
	    // TODO Get styles and update accordingly including pseudo
	    // selectors Clear at some point. Want to get text height if
	    // possible, but this also clears the link. Potentially add the
	    // link, get the styles, clear and read

	    var canvas = render_text(
		user + "@" + domain,
		$this.css("font"),
		parseInt($this.css("font-size")),
		$this.css("color"),
		$this.css("text-decoration")
	    );

	    $this.empty();
	    $this.append(canvas);

	    if ($this.prop("tagName") == "A") {
		$this.attr({"onmouseover" : ("this.href='mailto:' + '" + user +
					     "' + '@' + '" + domain + "'"),
	    		    "onmouseout" : "this.href=null"});
	    }
	});
    };

    return canvas_mail;
})( jQuery );
