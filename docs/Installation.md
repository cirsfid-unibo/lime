# Lime 2.2 installation guide

This new release of Lime offers many new features and improved performance.

On LIME's website you can find more detailed [documentation](http://lime.cirsfid.unibo.it/?page_id=6) but some parts are outdated.

## Prerequisites

- A release (build version) of LIME.
- A running istance of [LIME-server](https://github.com/cirsfid-unibo/lime-server)
- PHP (>=5.3.2), Optional, if you want to use [automatic markup](https://github.com/cirsfid-unibo/akn-parsers-php) and [AkomaNtoso diff](https://github.com/cirsfid-unibo/akn-diff-php).

## Installation

- Extract the `lime` folder from the LIME zip to a path accessible by the web server.
- If you want to change the default server url:
    - Go to `lime/scripts`
    - Run `npm install`
    - Run `node lime-config.js set server.node http://serverurl`
- Use LIME

## Notes

We are working on improving the installation experience by using NPM packages, this will make installing LIME super simple in the future.

