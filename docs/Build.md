# Lime build

This repository contains the source code of Lime, in order to run it you need to build it.

If you want just to try Lime without changing the source code you can download a build version from [here](http://lime.cirsfid.unibo.it/?page_id=8).


## Get the source
Since LIME contains submodules you must clone the repository with *--recursive* flag e.g. `git clone --recursive https://github.com/cirsfid-unibo/lime.git`. You shouldn't download the source code zip from Github because it doesn't contain submodules.

## Sencha Cmd
You need to install [Sencha Cmd](https://www.sencha.com/products/sencha-cmd/) which is used for the building process. We're using Sencha Cmd v5.1.3.61, it should work on newer versions but has not been tested yet.

### Workspace
We'are using a [Sencha Cmd Workspace](http://docs.sencha.com/cmd/5.x/workspaces.html) in order to build Lime you need to have a workspace too. You can download our workspace [here](http://sinatra.cirsfid.unibo.it/demo-akn/lime_ext_workspace.zip), it contains also the ExtJS 5 framework.

If you want to generate a new workspace check [this](http://docs.sencha.com/cmd/5.x/workspaces.html) page.

### Move workspace
When you have a workspace you need to move it to the Lime root folder.

## Build
Run `sencha app build` in a shell in order to build Lime, it takes a few minutes to finish.

The build process creates the folder "build" where you can find the build version of Lime.

## Run Lime
The production version is in the "build/production/LIME/" folder, in order to open it in a browser (e.g. http://localhost/lime/build/production/LIME/).

