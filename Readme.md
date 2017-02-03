![alt text](http://lime.cirsfid.unibo.it/wp-content/uploads/2014/02/logo_lime1.png "Logo Title")


LIME (Language Independent Markup Editor)
---


LIME is an extremely customizable web based editor that guides the user through the markup of non structured documents into well formed (optionally valid) structured XML document compliant to the language plugin chosen by the user. The LIME editor is an open source software and relies on many open source technologies. LIME is currently under development by the CIRSFID and the University of Bologna.

This repository contains the source code, in order to run LIME you need to [build it](docs/Build.md) or [download](http://lime.cirsfid.unibo.it/?page_id=8) a build version from the [project website](http://lime.cirsfid.unibo.it/) and check out the [Installation documentation](http://lime.cirsfid.unibo.it/?page_id=134).

Parsers folder was moved to separate repository [akn-parsers-php](https://github.com/cirsfid-unibo/akn-parsers-php) and become a submodule so in order to use parser in LIME you have to fetch the submodule with `git clone --recursive`.
