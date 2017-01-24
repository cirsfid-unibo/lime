![alt text](http://lime.cirsfid.unibo.it/wp-content/uploads/2014/02/logo_lime1.png "Logo Title")


LIME (Language Independent Markup Editor)
---


LIME is an extremely customizable web based editor that guides the user through the markup of non structured documents into well formed (optionally valid) structured XML document compliant to the language plugin chosen by the user. The LIME editor is an open source software and relies on many open source technologies. LIME is currently under development by the CIRSFID and the University of Bologna.

This repository contains the source code, in order to run LIME you need to [build it](docs/Build.md) or [download](http://lime.cirsfid.unibo.it/?page_id=8) a build version from the [project website](http://lime.cirsfid.unibo.it/) and check out the [Installation documentation](http://lime.cirsfid.unibo.it/?page_id=134).

##Testparser branch
[This branch](https://github.com/cirsfid-unibo/lime/tree/testparser) is a minimal version of LIME which allows to import and parse documents automatically.

After the installation you can parse a file in the browser or in the shell.
###Browser
Open the browser at the following url and wait:

`http://localhost:8080/lime/build/production/LIME/?fileToParse=[urlToFileToParse]`

Example:

`http://localhost:8080/lime/build/production/LIME/?fileToParse=http://localhost:8080/files/DECRETO_LEGISLATIVO_18_maggio_2015.docx`

###CLI
For the CLI parsing you have to intall nodejs and casperjs, in the [script](https://github.com/cirsfid-unibo/lime/tree/testparser/packages/parser-test/scripts) folder of [parser-test](https://github.com/cirsfid-unibo/lime/tree/testparser/packages/parser-test) package there are two scripts for testing: 'parseFile.js' and 'testRunner.js'.
#### parseFile.js
parse file downloaded from passed url and save the AkomaNtoso output in the passed output directory

Usage:

`casperjs parseFile.js fileUrl outputDir --disk-cache=yes`

Example:

`casperjs parseFile.js http://localhost:8080/files/DECRETO_LEGISLATIVO_18_maggio_2015.docx --disk-cache=yes`

#### testRunner.js
call parseFile.js on every file in the passed directory and save the result in the passed output directory

Usage:

`node testRunner.js inputDir outputDir`

Example:

`node testRunner.js filesTxt/ aknFiles/`
