/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 2015 Matthias Musialowski
 */

tinymce.PluginManager.requireLangPack( 'magicline', 'es,fr_FR,it,ro,ru' );

tinymce.PluginManager.add( 'magicline', function ( editor, url )
{
	// Add [nomagicline] css class to editor.settings.valid_classes if necessary
	if ( typeof editor.settings.valid_classes == 'string' ) editor.settings.valid_classes += ' nomagicline';
	else if ( typeof editor.settings.valid_classes == 'object' )
	{
		var valid_classes = editor.settings.valid_classes[ '*' ];

		editor.settings.valid_classes[ '*' ] = ( valid_classes != undefined ) ? valid_classes + ' nomagicline' : 'nomagicline';
	}

	editor.on( 'init', function ()
	{
		// Customizable settings vars ---------------
		var color = editor.settings.magicline_color || "#4A8DE0",
		    targetedItems = editor.settings.magicline_targetedItems || [ 'DIV', 'IMG' ],
		    triggerMargin = editor.settings.magicline_triggerMargin || 20,
		    insertedBlockTag = editor.settings.magicline_insertedBlockTag || 'p';
		//-------------------------------------------

		// Internal vars ----------------------------
		var magicline, target, lastTarget,
		    parentPadL, parentPadR, parentBorderL, parentBorderR,
		    prev, next, targetPos, targetSize,
		    mouseY, foundBlock, lastTargetPos,
		    checkTimer, isBorderBox, posX, posY, width,
		    rootBorderT,

		    $ = tinymce.dom.DomQuery,
		    DOM = editor.dom,
		    rootElem = editor.$()[ 0 ],
		    isInline = ( editor.settings.inline === true );
		// ------------------------------------------

		// Compute magicline position
		function setPosData( parent, tposY )
		{
			parentBorderL = parseInt( DOM.getStyle( parent, 'border-left-width', true ) );
			parentBorderR = parseInt( DOM.getStyle( parent, 'border-right-width', true ) );

			parentPadL = parseInt( DOM.getStyle( parent, 'padding-left', true ) );
			parentPadR = parseInt( DOM.getStyle( parent, 'padding-right', true ) );

			posY = tposY - triggerMargin;
			posX = DOM.getPos( parent, rootElem ).x;
			width = DOM.getSize( parent ).w;

			posX += parentPadL;
			width -= parentPadL + parentPadR;

			if ( isBorderBox )
			{
				posY -= rootBorderT;
			}

			if ( parent === rootElem )
			{
				width -= parentBorderL + parentBorderR;
			}
			else
			{
				posX += parentBorderL;
				width -= parentBorderL + parentBorderR;

				if ( isBorderBox ) posX -= parseInt( DOM.getStyle( rootElem, 'border-left-width', true ) );
			}
		}

		// Check mouse position and display magicline if necessary
		function checkMouse( E )
		{
			target = $( E.target );

			if ( target.hasClass( 'magicline-container' ) || target.parent( '.magicline-container' ).length > 0 ) return;

			foundBlock = false;

			while ( target.length > 0 )
			{
				if ( target[ 0 ] == rootElem ) break;
				if ( !target.hasClass( 'nomagicline' ) && !target.attr('data-nomagicline') && targetedItems.indexOf( target[ 0 ].tagName ) > -1 )
				{
					foundBlock = true;
					lastTarget = target;
					break;
				}

				target = target.parent();
			}

			if ( foundBlock )
			{
				isBorderBox = ( DOM.getStyle( rootElem, 'box-sizing', true ) === 'border-box' );
				rootBorderT = parseInt( DOM.getStyle( rootElem, 'border-top-width', true ) );

				targetPos = DOM.getPos( target[ 0 ], rootElem );
				targetSize = DOM.getSize( target[ 0 ] );
				mouseY = E.pageY;

				if ( isInline ) mouseY -= DOM.getPos( rootElem ).y;

				if ( !isBorderBox ) mouseY -= rootBorderT;

				// Top
				if ( Math.abs( targetPos.y - mouseY ) <= triggerMargin )
				{
					prev = target.prev();

					if ( prev.length == 0 || prev.hasClass( 'magicline-container' ) || targetedItems.indexOf( prev[ 0 ].tagName ) > -1 )
					{
						lastTargetPos = 'top';

						setPosData( target.parent()[ 0 ], targetPos.y );

						if( !rootElem.contains( magicline ) || DOM.getParents( magicline ).length <= 1 ) createMagicElements();

						DOM.setStyles( magicline,
						               {
							               'top':   posY + 'px',
							               'left':  posX + 'px',
							               'width': width + 'px'
						               } );

						DOM.show( magicline );
					}

					return;
				}
				// Bottom
				else if ( Math.abs( targetPos.y + targetSize.h - mouseY ) <= triggerMargin )
				{
					next = target.next();

					if ( next.length == 0 || next.hasClass( 'magicline-container' ) || targetedItems.indexOf( next[ 0 ].tagName ) > -1 )
					{
						lastTargetPos = 'bottom';

						setPosData( target.parent()[ 0 ], targetPos.y + targetSize.h );

						if( !rootElem.contains( magicline ) || DOM.getParents( magicline ).length <= 1 ) createMagicElements();

						DOM.setStyles( magicline,
						               {
							               'top':   posY + 'px',
							               'left':  posX + 'px',
							               'width': width + 'px'
						               } );

						DOM.show( magicline );
					}

					return;
				}
			}

			DOM.hide( magicline );
		}

		DOM.setStyle( rootElem, 'position', 'relative' );

		// # Create MagicLine Elements ####
		function createMagicElements()
		{
			if( magicline ) DOM.remove( magicline );

			magicline = DOM.create(
				'div',
				{
					'class': 'magicline-container',
					style:   'width: 100%; position: absolute; display: block; top: 0; left: 0; margin: 0; padding: 0; height: ' + triggerMargin * 2 + 'px;' +
					                  '-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;',
					contentEditable:  'false',
					'data-mce-bogus': '1'
				} );

			// | Dashed line
			DOM.add( magicline, 'div',
			         {
				         'class':          'magicline-dashedline',
				         style:            'position:absolute; top: 50%; left: 0; display: block; border: 0; border-top: 1px dashed ' + color + '; height: 0; width: 100%; margin: 0; padding: 0;',
				         'data-mce-bogus': '1'
			         } );

			// | Insert button
			var btInsert = DOM.add( magicline, 'div',
			                        {
				                        'class': 'magicline-bt_insert',
				                        style:   'position: absolute; top: 50%; right: 25px; height: 16px; width: 16px; margin: 0; padding: 0; margin-top: -7px;' +
				                                          'font-size: 0;' +
				                                          'color: white; background: url("' + url + '/img/icon.png") center no-repeat ' + color + ';' +
				                                          'cursor: pointer; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;',
				                        title:            tinymce.util.I18n.translate( 'Insert paragraph here' ),
				                        contentEditable:  'false',
				                        'data-mce-bogus': '1'
			                        } );

			// | Left Arrow
			DOM.add( magicline, 'div',
			         {
				         'class': 'magicline-arrow-left',
				         style:   'display: block; position: absolute; left: 0; top: 50%; height: 0; width: 0; margin: 0; padding: 0; margin-top: -7px;' +
				                           'border: 8px solid transparent; border-left-color: ' + color + ';',
				         contentEditable:  'false',
				         'data-mce-bogus': '1'
			         } );

			// | Right arrow
			DOM.add( magicline, 'div',
			         {
				         'class': 'magicline-arrow-right',
				         style:   'display: block; position: absolute; right: 0; top: 50%; height: 0; width: 0; margin: 0; padding: 0; margin-top: -7px;' +
				                           'border: 8px solid transparent; border-right-color: ' + color + ';',
				         contentEditable:  'false',
				         'data-mce-bogus': '1'
			         } );

			// | 'click' event listener
			DOM.bind( magicline, 'click',
			          function ( E )
			          {
				          if ( E.target === btInsert )
				          {
					          editor.focus( false );

					          var p = DOM.create( insertedBlockTag, {}, '<br data-mce-bogus="1">' );

					          if ( lastTargetPos === 'top' ) lastTarget.before( p );
					          else lastTarget.after( p );

					          editor.selection.select( p, true );
				          }

				          DOM.hide( magicline );
			          } );

			DOM.hide( magicline );
			DOM.add( rootElem, magicline );
		}

		createMagicElements();

		// Listen to mouse move
		editor.$().on( 'mousemove', function ( E )
		{
			clearTimeout( checkTimer );
			checkTimer = setTimeout( function () { checkMouse( E ); }, 25 );
		} );
	} );

} );
