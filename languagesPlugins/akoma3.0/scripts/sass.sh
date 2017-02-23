#!/bin/bash

sass --style compressed --sourcemap=none styles/content.scss interface/default/content.css
sass --style compressed --sourcemap=none styles/akn_it.scss interface/default/it/content.css
sass --style compressed --sourcemap=none styles/akn_es.scss interface/default/es/content.css
