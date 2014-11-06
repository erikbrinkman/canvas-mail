'use strict'

$ = jQuery

capitalize = (str) ->
    str.toLowerCase().replace /(?:^|\W)\w/g, (first) -> first.toUpperCase()

text_transform =
    none: (str) -> str
    capitalize: capitalize
    uppercase: (str) -> str.toUpperCase()
    lowercase: (str) -> str.toLowerCase()

parse_decoration = (decoration) ->
    [type, ...] = decoration.split ' '
    switch type
        when 'overline' then (font_size) ->
            height: 0
            thickness: font_size / 12
        when 'line-through' then (font_size) ->
            height: font_size / 2
            thickness: font_size / 20
        when 'underline' then (font_size) ->
            height: font_size
            thickness: font_size / 12
        when 'none' then ->
            height: 0
            thickness: 0

parse_shadow = (shadow) ->
    if shadow is 'none'
        null
    else
        [color..., h_shadow, v_shadow, blur] = shadow.split ' '
        blur: parseInt blur, 10
        v_shadow: parseInt v_shadow, 10
        h_shadow: parseInt h_shadow, 10
        color: color.join ' '

measure_text = (text, font) ->
    txt = $ '<span></span>'
    txt.text text
    txt.css 'font', font
    $ document.documentElement
    .append txt
    height = do txt.height
    width = do txt.width
    do txt.remove
    height: height
    width: width

draw_text = (canvas, text, font, font_size, color, decoration, transform, shadow) ->
    text = text_transform[transform] text
    shadow = parse_shadow shadow
    size = measure_text text, font
    canvas.attr size

    ctx = canvas[0].getContext '2d'
    do ctx.save
    ctx.fillStyle = color
    ctx.font = font
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    if shadow
        ctx.shadowBlur = shadow.blur
        ctx.shadowOffsetY = shadow.v_shadow
        ctx.shadowOffsetX = shadow.h_shadow
        ctx.shadowColor = shadow.color

    ctx.fillText text, 0, 0
    do ctx.restore

    dec = (parse_decoration decoration) font_size
    if dec.thickness isnt 0
        do ctx.beginPath
        ctx.strokeStyle = color;
        ctx.lineWidth = dec.thickness;
        ctx.moveTo 0, dec.height
        ctx.lineTo size.width, dec.height
        do ctx.stroke
        do ctx.restore

    canvas

draw_text_elem = (element, canvas, user, domain) ->
    draw_text canvas, user + '@' + domain, element.css('font'),
        parseInt(element.css('font-size'), 10), element.css('color'),
        element.css('text-decoration'), element.css('text-transform'),
        element.css('text-shadow')

form_mailto = (user, domain, options) ->
    main = "mailto:" + user + "@" + domain;

    cc = (u + '@' + options.cc_domains[i] for u, i in options.cc_users).join ','
    bcc = (u + '@' + options.bcc_domains[i] for u, i in options.bcc_users).join ','
    subject = encodeURI(options.subject ? '');
    body = encodeURI(options.body ? '');
    params = [];
    params.push 'cc=' + cc if cc
    params.push 'bcc=' + bcc if bcc
    params.push 'subject=' + subject if subject
    params.push 'body=' + body if body

    all_params = params.join '&'
    main = main + '?' + all_params if all_params
    main
        
$.fn.canvas_mail = (user, domain, options = {}) ->
    options.cc_users ?= [];
    options.cc_domains ?=  [];
    options.bcc_users ?= [];
    options.bcc_domains ?= [];
        
    @.each ->
        $$ = $ @
        canvas = $ '<canvas></canvas>'
        canvas.css 'vertical-align', 'text-top'

        draw_text_elem $$, canvas, user, domain
        do $$.empty
        $$.append canvas

        if ($$.prop 'tagName') is 'A'
            $$.mouseover ->
                $ @
                .attr 'href', form_mailto user, domain, options
                draw_text_elem $$, canvas, user, domain
            $$.mouseout ->
                $ @
                .attr 'href', null
                draw_text_elem $$, canvas, user, domain

$.fn.link_mail = (user, domain, options = {}) ->
    options.cc_users ?= [];
    options.cc_domains ?=  [];
    options.bcc_users ?= [];
    options.bcc_domains ?= [];
        
    @.each ->
        $$ = $ @
        if ($$.prop 'tagName') is 'A'
            $$.mouseover ->
                $ @
                .attr 'href', form_mailto user, domain, options
            $$.mouseout ->
                $ @
                .attr 'href', null
