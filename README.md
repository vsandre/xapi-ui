XAPI UI
========

Next steps
-----------
- support multiple xapi instances
- support other services based on bbox queries (OSM History, OWL, ...)
- set maximum bbox for a service
- list of predefined bboxs

Description
-----------

This repository provides an HTML based frontend to OpenStreetMap's
XAPI service, providing easy to use access to its most common feature

While this services does not explicitly require running an XAPI
service, it is recommended to point the service only at your own XAPI
server in order to minimize traffic impact.

Installation
------------

XAPI-UI runs entirely client-side and has no server executable
components. To install, simply copy the file files in the repository
to your own server and create a `config.json` file at the top level to
store your settings.

One may optionally redirect the index page of a site to the xapi.html
page.

Configuration
-------------
You must have `config.json` file which contains configuration for the
site installation. You may use the `config-sample.json` file as a
starting point.

Customization
-------------

The HTML and CSS are entirely customizable, but the div IDs must
remain the same in order for the javascript (which runs the service)
to operate effectively.
