jQuery(function($){
	$.getJSON('../js/uidevtest-data.js', function(data){
		// Attach the feed to the body so that the data can be
		// quickly used later without the need for more requests
		$('body').data('stories', data.objects);

		// If a story was requested, display it, otherwise display
		// the list of the stories in the lively data feed
		var story_idx = get_story_idx();
		if(story_idx !== null){
			display_story(story_idx);
		} else {
			display_list();
		}
	});

	function display_story(idx){
		// Displays a story provided an integer representing the
		// story's 0-based index among the stories data feed
		var story = get_story(idx);
		if(story === null){
			// Display 404
		} else {
			// Kapa-Chow!
		}
	}

	function display_list(){
		// Displays a list of stories from the stories data feed
		$.each($('body').data('stories'), function(idx, story){
			// Go to town!
		});
	}

	function get_story(idx){
		// Returns a story from the stories data feed for the given
		// index , or `null`, if one doesn't exist for the index
		var story = $('body').data('stories')[idx];
		if(typeof(story) == 'undefined')
			return null;
		return story;
	}
});

function get_story_idx(){
	// Returns a 0-based story index, based on a "story" URL param,
	// or returns `null`, if story index not applicable
	var prefix = 'sto';
	var param = getURLParameter('story');
	// Create a regexp that allows 2 digits for the story index,
	// since that's what the `sto01`
	var regexp = new RegExp('^' + prefix + '\\d{2}$');
	if(param !== null && param.match(regexp)){
		var idx = parseInt(param.slice(prefix.length));
		if(!isNaN(idx))
			return idx - 1;
	}
	return null;
}

function getURLParameter(name){
	// A "universal" URL param function from SO
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
