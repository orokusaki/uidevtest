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

		$('.story').show();
		$('.feed_list').hide();

		// Remove existing content
		clear_story();

		// Get the story
		var story = get_story(idx);

		if(story === null){
			// Display 404
			$('title').text('Error - 404');
			$('.story .info .title').text('Error - 404');
			$('.story .info .meta').text('(story not found)');
			$('<img>')
				.attr('src', 'http://placekitten.com/260/350')
				.attr('alt', 'Meow :(')
				.attr('class', 'loads')
				.prependTo($('.story .left .photo'));
		} else {
			// Display story

			// Page title
			$('title').text(story.title);

			// Headline
			$('.story .info .title').text(story.title);

			// Publish and Update dates
			var pub_date = ap_date(story.pub_date);
			var updated = ap_date(story.updated);
			$('.story .info .meta').text('Updated: ' + updated + ' | Posted: ' + pub_date);

			// Caption (uses summary when caption is null - sneaky, sneaky)
			var caption = story.lead_photo_caption;
			if(caption === null)
				caption = story.summary;
			$('.story .left .photo_desc').text(caption);

			// Main photo and credit
			$('<img>')
				.attr('src', story.lead_photo_image_url)
				.attr('alt', caption)
				.attr('class', 'loads')
				.prependTo($('.story .left .photo'));
			$('.story .left .photo figcaption').text(story.lead_photo_credit);

			// Right content / author
			$('.story .right .author').text('By ');
			$('<strong>')
				.text(story.author.join(', '))
				.appendTo($('.story .right .author'));
			$('.story .right .content').html(story.story);
		}
	}

	function clear_story(){
		// Removes story content
		$('.story .loads:not(img)').html('');
		$('.story img.loads').remove();
	}

	function get_story(idx){
		// Returns a story from the stories data feed for the given index, or
		// `null`, if one doesn't exist for the index
		var story = $('body').data('stories')[idx];
		if(typeof(story) == 'undefined')
			return null;
		return story;
	}

	function ap_date(iso_datetime){
		// Formats the provided ISO date string into AP format
		var d = Date.parse(iso_datetime);
		var d = new Date(d);
		return d.getHours12()
			+ ':'
			+ d.getFullMinutes()
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

	function display_list(){
		// Displays a list of stories from the stories data feed

		// Page title
		$('title').text('News');

		$('.story').hide();
		$('.feed_list').show();

		var feed_item_template = $('#feed_item_template .feed_item');
		$.each($('body').data('stories'), function(idx, story){
			var feed_item = feed_item_template.clone();

			// Thumbnail
			var caption = story.lead_photo_caption;
			if(caption === null)
				caption = story.summary;
			$('<img>')
				.attr('src', story.lead_photo_image_thumb)
				.attr('alt', caption)
				.appendTo(feed_item.find('.thumb'));

			// Title
			var story_num = idx + 1;
			if(story_num < 10)
				story_num = '0' + story_num;
			var story_link = 'index.html?story=sto' + story_num;
			$('<a>')
				.attr('href', story_link)
				.text(story.title)
				.appendTo(feed_item.find('.title'));

			// Categories
			feed_item.find('.categories').text(story.categories_name.join(' / '));

			// Meta
			var meta = feed_item.find('.meta');
			var pub_date = ap_date(story.pub_date);
			var updated = ap_date(story.updated);
			$('<p>')
				.text('Posted: ' + pub_date)
				.appendTo(meta);
			$('<p>')
				.text('Updated: ' + updated)
				.appendTo(meta);

			feed_item.appendTo($('.feed_list'));
		});
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
(function(){
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
	};

	// 2-digit minutes
	Date.prototype.getFullMinutes = function(){
		var m = this.getMinutes()
		if(m < 10){
			return '0' + m;
		}
		return m;
	};
})();
