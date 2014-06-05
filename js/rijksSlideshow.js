function getFirstItems(limit) {
	var items = "";
	for (var i = 0; i < limit; i++) {
		if (rijksmuseum.content[i].webImage) {
			items += "<li><img src='"+rijksmuseum.content[i].webImage.url+"' data-id='"+rijksmuseum.content[i].id+"'/></li>";
		}
	};
	return $( items );
}

var rijksSlideshow = (function() {

	var $slideshow = $( '#cbp-bislideshow' ),
		$controls = $( '#cbp-bicontrols' ),
		navigation = {
			$navPrev : $controls.find( 'span.cbp-biprev' ),
			$navNext : $controls.find( 'span.cbp-binext' ),
			$navPlayPause : $controls.find( 'span.cbp-bipause' )
		},
		current = 0,
		navigationsForward = 0,
		navigationsBackward = 0,
		slideshowtime,
		itemsCount,
		isSlideshowActive = true,
		middleLimit = 9,
		removeAndAdd = false,
		lastLimit = 20,
		interval = 3500;

	function loadMoreItems(quantity, back) {
		var nitems = "";
		var i = 0;

		while (i < quantity) {
			if (rijksmuseum.content[i+lastLimit].webImage) {
				nitems += "<li><img src='"+rijksmuseum.content[i+lastLimit].webImage.url+"' data-id='"+rijksmuseum.content[i+lastLimit].id+"'/></li>";
				i++;
			}
		}

		var $new_items = $( nitems );

		if (back) {
			console.log($new_items.find('img').attr("data-id"));
			$items = $new_items.add($items);
			console.log("items 0: "+$items.eq( 0 ).find('img').attr("data-id"));
			$slideshow.prepend($new_items);
		} else {
			$items = $items.add($new_items);
			$slideshow.append($new_items);
		}

		if ( Modernizr.backgroundsize ) {
			$new_items.each( function() {
				var $item = $( this );
				$item.css( 'background-image', 'url(' + $item.find( 'img' ).attr( 'src' ) + ')' );
			});
		}
	}

	function init( config ) {
		$items = getFirstItems(lastLimit);

		$slideshow.append( $items )

		itemsCount = $items.length;
		current = middleLimit;
		// preload the images
		$slideshow.imagesLoaded()
			.always( function( instance ) {
				if( Modernizr.backgroundsize ) {
						$items.each( function() {
							var $item = $( this );
							$item.css( 'background-image', 'url(' + $item.find( 'img' ).attr( 'src' ) + ')' );
						} );
					}
					else {
						$slideshow.find( 'img' ).show();
						// for older browsers add fallback here (image size and centering)
					}
					// show first item
					$items.eq( current ).css( 'opacity', 1 );
					// initialize/bind the events
					initEvents();
					// start the slideshow
					startSlideshow();
			})
	}

	function initEvents() {

		navigation.$navPlayPause.on( 'click', function() {

			var $control = $( this );
			if( $control.hasClass( 'cbp-biplay' ) ) {
				$control.removeClass( 'cbp-biplay' ).addClass( 'cbp-bipause' );
				startSlideshow();
			}
			else {
				$control.removeClass( 'cbp-bipause' ).addClass( 'cbp-biplay' );
				stopSlideshow();
			}

		} );

		navigation.$navPrev.on( 'click', function() { 
			navigate( 'prev' ); 
			if( isSlideshowActive ) { 
				startSlideshow(); 
			} 
		} );
		navigation.$navNext.on( 'click', function() { 
			navigate( 'next' ); 
			if( isSlideshowActive ) { 
				startSlideshow(); 
			}
		} );

		document.onkeydown = function(e) {
			e = e || window.event;
			if (e.keyCode == '39') {
				navigate( 'next' );
				if( isSlideshowActive ) { 
					startSlideshow(); 
				}
			} else if (e.keyCode == '37') {
				navigate( 'prev' );
				if( isSlideshowActive ) { 
					startSlideshow(); 
				}
			}
		}
	}

	function navigate( direction ) {
		// current item
		var $itemToRemove = null;
		var $oldItem = $items.eq( current );
		var addBack = false;
		var forward = false;

		if( direction === 'next' ) {
			$itemToRemove = $slideshow.find('li').eq(0);
			forward = true;
			navigationsForward += 1;
			console.log("forward: "+navigationsForward);
			//current = current < itemsCount - 1 ? ++current : 0;
		}

		else if( direction === 'prev' ) {
			//addBack = true;
			//$itemToRemove = $items.eq( $items.length-1 );
			current = current > 0 ? --current : itemsCount - 1;
		}

		if($itemToRemove) {
	 	   	$items = $items.not($itemToRemove);
			$slideshow.find('li').eq(0).remove();
		}
		
		if (forward) {
			if (lastLimit < rijksmuseum.content.length) {
				var increment = 1;	
				if (lastLimit + increment < rijksmuseum.content.length) {
					loadMoreItems(increment, addBack);
					lastLimit += increment;
				}	
			} 
		}

		var $newItem = $items.eq( current );
		$oldItem.css( 'opacity', 0 );
		$newItem.css( 'opacity', 1 );

		var slide_id = $items.eq(current).find('img').attr('data-id');
		var state = {
			id: slide_id, 
	    }

		var stateToPush = slide_id;
		history.pushState(state, "Image", stateToPush);

		console.log("TotalItems: "+$items.length);
		itemsCount = $items.length;
	}

	function startSlideshow() {

		isSlideshowActive = true;
		clearTimeout( slideshowtime );
		slideshowtime = setTimeout( function() {
			navigate( 'next' );
			startSlideshow();
		}, interval );

	}

	function stopSlideshow() {
		isSlideshowActive = false;
		clearTimeout( slideshowtime );
	}

	return { init : init };

})();