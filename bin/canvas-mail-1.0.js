/*global jQuery */
var CANVAS_MAIL = (function ($) {
    "use strict";
    /*jslint browser:true */

    var canvas_mail = {}, // Package
        text_transform; // Object for transforming text

    /* Capitalize a string simialr to the css text-transform: capitalize. I'm not
     * sure that this rule is identical to the css. It almost certainly won't
     * work for none english uses. */
    function capitalize(str) {
        return str.toLowerCase().replace(/(?:^|\W)\w/g, function (first) {
            return first.toUpperCase();
        });
    }

    /* Object mapping from text-transform style to the proper function for
     * transforming the string. */
    text_transform = {
        'none': function (str) { return str; },
        'capitalize': capitalize,
        'uppercase': function (str) { return str.toUpperCase(); },
        'lowercase': function (str) { return str.toLowerCase(); }
    };

    /* Parses a decoration string, and returns a function of font size, which
     * then returns an object with the height and thickenss to render a heuristic
     * text decoration line at. */
    function parse_decoration(decoration) {
        var arr,
            dec_type;
        arr = decoration.split(" ");
        dec_type = arr.shift();
            // dec_style = arr.shift(), // Nonstandard, ignored
            // dec_color = arr.join(" "); // Nonstandard, ignored

        return function (font_size) {
            return ({
                'overline': {
                    line_height: 0,
                    thickness: font_size / 12
                },
                'line-through': {
                    line_height: font_size / 2,
                    thickness: font_size / 20
                },
                'underline': {
                    line_height: font_size,
                    thickness: font_size / 12
                },
                'none': {
                    line_height: 0,
                    thickness: 0
                }
            })[dec_type];
        };
    }

    /* Parse the shadow specification from the shadow string. Returns an object
     * with `blur`, `v_shadow`, `h_shadow`, and `color`. */
    function parse_shadow(shadow) {
        if (shadow === 'none') {
            return null;
        }
        var arr = shadow.split(" ");
        return {
            blur: parseInt(arr.pop(), 10),
            v_shadow: parseInt(arr.pop(), 10),
            h_shadow: parseInt(arr.pop(), 10),
            color: arr.join(" ")
        };
    }

    /* Given text and a font specification, measure its size. The width can also
     * be done with a canvas element, but this seemed more robust. Used to set
     * canvas size. */
    function measure_text(text, font) {
        var txt, height, width;
        txt = $("<span></span>");
        txt.text(text);
        txt.css("font", font);
        $(document.documentElement).append(txt);
        height = txt.height();
        width = txt.width();
        txt.remove();
        return {
            height: height,
            width: width
        };
    }

    /* Gicen a canvas, clear it, resize it, and draw the supplied text with the
     * given styles. While it takes several styles as input, not all are able to
     * be recreated as identically to css styling. */
    function draw_text(canvas, text, font, font_size, color, decoration, transform,
                       shadow) {
        var size, // Canvas size
            ctx,  // Canvas context
            dec;  // Decoration object

        // Text styles
        text = text_transform[transform](text);
        shadow = parse_shadow(shadow);

        // Create resize canvas
        size = measure_text(text, font);
        /* XXX Shadows go beyond normal size and should probably be taken into
           account when resizing canvas. */
        // Setting the width and height also resets the canvas.
        canvas.attr(size);

        // Setup canvas
        ctx = canvas[0].getContext("2d");
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Set up shadow, currently doesn't work well :(
        if (shadow) {
            ctx.shadowBlur = shadow.blur;
            ctx.shadowOffsetY = shadow.v_shadow;
            ctx.shadowOffsetX = shadow.h_shadow;
            ctx.shadowColor = shadow.color;
        }

        // Draw text
        ctx.fillText(text, 0, 0);
        ctx.restore();

        // Draw decoration
        dec = parse_decoration(decoration)(font_size);

        if (dec.thickness !== 0) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = dec.thickness;
            ctx.moveTo(0, dec.line_height);
            ctx.lineTo(size.width, dec.line_height);
            ctx.stroke();
            ctx.restore();
        }

        return canvas;
    }

    /* Draws email text with style of `element`, on `canvas` with user `user`,
     * and domain `domain`. */
    function draw_text_elem(element, canvas, user, domain) {
        return draw_text(
            canvas,
            user + "@" + domain,
            element.css("font"),
            parseInt(element.css("font-size"), 10),
            element.css("color"),
            element.css("text-decoration"),
            element.css("text-transform"),
            element.css("text-shadow")
        );
    }

    /* Returns a proper mailto link given a user, domain, and otions for cc, bcc,
     * subject, and body text */
    function form_mailto(user, domain, options) {
        var main, // Main part of mailto string
            cc,
            bcc,
            subject,
            body,
            params,
            all_params; // Other fields

        main = "mailto:" + user + "@" + domain;

        cc = options.cc_users.map(
            function (u, i) { return u + "@" + options.cc_domains[i]; }
        ).join(",");
        bcc = options.bcc_users.map(
            function (u, i) { return u + "@" + options.bcc_domains[i]; }
        ).join(",");
        subject = encodeURI(options.subject || "");
        body = encodeURI(options.body || "");

        params = [];
        if (cc) { params.push("cc=" + cc); }
        if (bcc) { params.push("bcc=" + bcc); }
        if (subject) { params.push("subject=" + subject); }
        if (body) { params.push("body=" + body); }

        all_params = params.join("&");
        if (all_params) {
            return main + "?" + all_params;
        }
        return main;
    }

    canvas_mail.render_email = function (elements, user, domain, options) {
        /* elements : elements to clear and add a canvas email to
           user     : email user name
           domain   : email domain name
           options  : optional parameters in the form of an object
               subject     : email subject
               body        : email body
               cc_users    : array of cc users
               cc_domains  : array of cc domains
               bcc_users   : array of bcc users
               bcc_domains : array of bcc domains
        */

        // Fill with defaults
        options = options || {};
        options.cc_users = options.cc_users || [];
        options.cc_domains = options.cc_domains || [];
        options.bcc_users = options.bcc_users || [];
        options.bcc_domains = options.bcc_domains || [];

        elements.each(function () {
            var $this = $(this), // jQuery
                canvas = $("<canvas></canvas>"); // Canvas
            canvas.css("vertical-align", "text-top");

            draw_text_elem($this, canvas, user, domain);
            $this.empty();
            $this.append(canvas);

            if ($this.prop("tagName") === "A") { // Add function for anchor
                $this.mouseover(function () {
                    $(this).attr("href", form_mailto(user, domain, options));
                });
                $this.mouseout(function () {
                    $(this).attr("href", null);
                });
                $this.hover(function () {
                    draw_text_elem($this, canvas, user, domain);
                }, function () {
                    draw_text_elem($this, canvas, user, domain);
                });
            }
        });
    };

    return canvas_mail;
}(jQuery));
