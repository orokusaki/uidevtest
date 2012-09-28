jQuery(function($){
	$.getJSON('../js/uidevtest-data.js', function(data){
		// Attach the feed to the body so that the data can be quickly used
		// later without the need for more requests
		$('body').data('stories', data.objects);

		// If a story was requested, display it, otherwise display the list of
		// the stories in the lively data feed
		var story_idx = get_story_idx();
		if(story_idx !== null){
			display_story(story_idx);
		} else {
			display_list();
		}
	});

	function display_story(idx){
		// Displays a story provided an integer representing the story's
		// 0-based index among the stories data feed, else displays a 404

		// Remove existing content
		clear_story();

		// Get the story
		var story = get_story(idx);

		if(story === null){
			// Display 404
			$('.story .info .title').text('Error 404');
			$('.story .info .meta').text('(story not found)');
			$('<img>')
				.attr('src', 'http://placekitten.com/260/350')
				.attr('alt', 'Meow :(')
				.attr('class', 'loads')
				.prependTo($('.story .left .photo'));
		} else {
			// Display story
			$('.story .info .title').text(story.title);
			var pub_date = ap_date(story.pub_date);
			var updated = ap_date(story.updated);
			$('.story .info .meta').text('Updated: ' + updated.toLocaleString() + ' | Posted: ' + pub_date.toLocaleString());
			var caption = story.lead_photo_caption;
			if(caption === null){
				caption = story.summary;
			}

			// Main photo and credit
			$('<img>')
				.attr('src', story.lead_photo_image_url)
				.attr('alt', caption)
				.attr('class', 'loads')
				.prependTo($('.story .left .photo'));
			$('.story .left .photo figcaption').text(story.lead_photo_credit);

			// Caption
			$('.story .left .photo_desc').text(caption);

			// Right content / author
			$('.story .right .author').text('By ');
			$('<strong>')
				.text(story.author.join(', '))
				.appendTo($('.story .right .author'));
			$('.story .right .content').html(story.story);

			// Crumb trail
			var crumbs = $('.crumbs ul');
			crumbs.find('.dynamic').remove();
			$.each(story.categories_name, function(idx, category_name){
				$('<strong>').html('&gt;').appendTo($('<li>').appendTo(crumbs));
				var crumb = $('<li>')
					.attr('class', 'dynamic')
					.appendTo(crumbs)
				$('<a>')
					.attr('href', '#')
					.text(category_name)
					.appendTo(crumb)
			});
			// Current story crumb
			$('<strong>').html('&gt;').appendTo($('<li>').appendTo(crumbs));
			var crumb_title = story.title;
			if(crumb_title.length > 30){
				crumb_title = crumb_title.slice(0, 30) + '&hellip;';
			}
			$('<strong>')
				.html(crumb_title)
				.appendTo($('<li>').appendTo(crumbs));
		}
	}

	function ap_date(iso_datetime){
		// Formats the provided ISO date string into AP format
		var d = Date.parse(iso_datetime);
		var d = new Date(d);
		return d.getHours12()
			+ ':'
			+ d.getMinutes()
			+ ' '
			+ d.getAPMeridiem()
			+ ' '
			+ d.getDayName()
			+ ', '
			+ d.getMonthAbbr()
			+ '. '
			+ d.getDate()
			+ ', '
			+ d.getFullYear();
	}

	function clear_story(){
		// Removes story content
		$('.story .loads:not(img)').html('');
		$('.story img.loads').remove();
	}

	function display_list(){
		// Displays a list of stories from the stories data feed
		$.each($('body').data('stories'), function(idx, story){
			// Go to town!
		});
	}

	function get_story(idx){
		// Returns a story from the stories data feed for the given index, or
		// `null`, if one doesn't exist for the index
		var story = $('body').data('stories')[idx];
		if(typeof(story) == 'undefined')
			return null;
		return story;
	}
});

function get_story_idx(){
	// Returns a 0-based story index, based on a "story" URL param, or returns
	// `null`, if the proper pattern is not provided in the "story" param
	var prefix = 'sto';
	var param = getURLParameter('story');
	// Create a regexp that allows 2 digits for the story index, since that's
	// what the `sto01` example in the instructions indicates (leading zero)
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

// Some datetime-fu so that I don't have to use jQuery UI's half-backed date
// picker, or do some ugly-inline date time formatting - inspired by SO
(function($){
	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

	// Abbr of month name
	Date.prototype.getMonthAbbr = function(){
		return months[this.getMonth()];
	};

	// Name of day of week
	Date.prototype.getDayName = function(){
		return days[this.getDay()];
	};

	// AP-formatted a.m. / p.m.
	Date.prototype.getAPMeridiem = function(){
		if(this.getHours() < 12)
			return 'a.m.';
		return 'p.m.';
	};

	// 12-hour-based hours
	Date.prototype.getHours12 = function(){
		if(this.getHours() < 13)
			return this.getHours();
		return this.getHours() - 12;
	}
})();
