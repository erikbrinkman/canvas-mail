Canvas Mail
==========

Javascript module to hide email from spammers by rendering it on canvas, and
keeping it as far out of the DOM as possible. Depends on jQuery.

With the current implementation, at verious points of computation the email
string will exist in contiguous memory at various points in execution. Also, if
a Canvas Mail element is added to an anchor, the anchor will have the email in
its href field during mouseover.

See [index.html](index.html) more information and some examples.
