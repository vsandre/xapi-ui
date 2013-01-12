XAPI UI
========

Description
-----------

A web user interface for building for building XAPI URLS.

See it running: http://harrywood.co.uk/maps/uixapi/xapi.html

This repository provides an HTML based frontend to OpenStreetMap's
XAPI service, providing easy to use access to its most common feature
.
Originally developed by emacsen, this repo has the version Harry is running.
Harry is also tracking issues and enhancement requests here with this github
repo.

For details of XAPI see: http://wiki.openstreetmap.org/wiki/Xapi

The in-browser table rendering feature is by Dan Stowell.

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
