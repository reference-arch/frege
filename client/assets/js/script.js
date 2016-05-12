$(function () {

	// Globals variables

		// 	An array containing objects with information about the projects.
	var projects = [],

		// Our filters object will contain an array of values for each filter

		// Example:
		// filters = {
		// 		"manufacturer" = ["Apple","Sony"],
		//		"storage" = [16]
		//	}
		filters = {};


	//	Event handlers for frontend navigation

	//	Checkbox filtering

	var checkboxes = $('.all-projects input[type=checkbox]');

	checkboxes.click(function () {

		var that = $(this),
			specName = that.attr('name');

		// When a checkbox is checked we need to write that in the filters object;
		if(that.is(":checked")) {

			// If the filter for this specification isn't created yet - do it.
			if(!(filters[specName] && filters[specName].length)){
				filters[specName] = [];
			}

			//	Push values into the chosen filter array
			filters[specName].push(that.val());

			// Change the url hash;
			createQueryHash(filters);

		}

		// When a checkbox is unchecked we need to remove its value from the filters object.
		if(!that.is(":checked")) {

			if(filters[specName] && filters[specName].length && (filters[specName].indexOf(that.val()) != -1)){

				// Find the checkbox value in the corresponding array inside the filters object.
				var index = filters[specName].indexOf(that.val());

				// Remove it.
				filters[specName].splice(index, 1);

				// If it was the last remaining value for this specification,
				// delete the whole array.
				if(!filters[specName].length){
					delete filters[specName];
				}

			}

			// Change the url hash;
			createQueryHash(filters);
		}
	});

	// When the "Clear all filters" button is pressed change the hash to '#' (go to the home page)
	$('.filters button').click(function (e) {
		e.preventDefault();
		window.location.hash = '#';
	});


	// Single project page buttons

	var singleProjectPage = $('.single-project');

	singleProjectPage.on('click', function (e) {

		if (singleProjectPage.hasClass('visible')) {

			var clicked = $(e.target);

			// If the close button or the background are clicked go to the previous page.
			if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
				// Change the url hash with the last used filters.
				createQueryHash(filters);
			}

		}

	});


	// These are called on page load

	// Get data about our projects from projects.json.
	$.getJSON( "https://frege.herokuapp.com/projects", function( data ) {

		// Write the data into our global variable.
		projects = data;

		// Call a function to create HTML for all the projects.
		generateAllProjectsHTML(projects);

		// Manually trigger a hashchange to start the app.
		$(window).trigger('hashchange');
	});


	// An event handler with calls the render function on every hashchange.
	// The render function will show the appropriate content of out page.
	$(window).on('hashchange', function(){
		render(decodeURI(window.location.hash));
	});


	// Navigation

	function render(url) {

		// Get the keyword from the url.
		var temp = url.split('/')[0];

		// Hide whatever page is currently shown.
		$('.main-content .page').removeClass('visible');

		var	map = {

			// The "Homepage".
			'': function() {
				// Clear the filters object, uncheck all checkboxes, show all the projects
				filters = {};
				checkboxes.prop('checked',false);
				renderProjectsPage(projects);
			},

			// Add a new project page.
			'#add': function() {
				// Get the index of which project we want to show and call the appropriate function.
				var index = url.split('#add/')[1].trim();
				renderSingleProjectPage(index, projects);
			},

			// Single Projects page.
			'#project': function() {
				// Get the index of which project we want to show and call the appropriate function.
				var index = url.split('#project/')[1].trim();
				renderSingleProjectPage(index, projects);
			},

			// Page with filtered projects
			'#filter': function() {
				// Grab the string after the '#filter/' keyword. Call the filtering function.
				url = url.split('#filter/')[1].trim();
				// Try and parse the filters object from the query string.
				try {
					filters = JSON.parse(url);
				}
				// If it isn't a valid json, go back to homepage ( the rest of the code won't be executed ).
				catch(err) {
					window.location.hash = '#';
					return;
				}
				renderFilterResults(filters, projects);
			}

		};

		// Execute the needed function depending on the url keyword (stored in temp).
		if(map[temp]){
			map[temp]();
		}
		// If the keyword isn't listed in the above - render the error page.
		else {
			renderErrorPage();
		}

	}


	// This function is called only once - on page load.
	// It fills up the projects list via a handlebars template.
	// It recieves one parameter - the data we took from projects.json.
	function generateAllProjectsHTML(data){

		var list = $('.all-projects .projects-list');

		var theTemplateScript = $("#projects-template").html();
		//Compile the template​
		var theTemplate = Handlebars.compile (theTemplateScript);
		list.append (theTemplate(data));


		// Each projects has a data-index attribute.
		// On click change the url hash to open up a preview for this project only.
		// Remember: every hashchange triggers the render function.
		list.find('li').on('click', function (e) {
			e.preventDefault();

			var projectIndex = $(this).data('index');

			window.location.hash = 'project/' + projectIndex;
		})
	}

	// This function receives an object containing all the project we want to show.
	function renderProjectsPage(data){

		var page = $('.all-projects'),
			allProjects = $('.all-projects .projects-list > li');

		// Hide all the projects in the projects list.
		allProjects.addClass('hidden');

		// Iterate over all of the projects.
		// If their ID is somewhere in the data object remove the hidden class to reveal them.
		allProjects.each(function () {

			var that = $(this);

			data.forEach(function (item) {
				if(that.data('index') == item.id){
					that.removeClass('hidden');
				}
			});
		});

		// Show the page itself.
		// (the render function hides all pages so we need to show the one we want).
		page.addClass('visible');

	}


	// Opens up a preview for one of the projects.
	// Its parameters are an index from the hash and the projects object.
	function renderSingleProjectPage(index, data){

		var page = $('.single-project'),
			container = $('.preview-large');

		// Find the wanted project by iterating the data object and searching for the chosen index.
		if(data.length){
			data.forEach(function (item) {
				if(item.id == index){
					// Populate '.preview-large' with the chosen project's data.
					container.find('h3').text(item.name);
					container.find('img').attr('src', 'http://image005.flaticon.com/25/svg/25/25231.svg');
					container.find('p').text(item.description);
				}
			});
		}

		// Show the page.
		page.addClass('visible');

	}

	// Find and render the filtered data results. Arguments are:
	// filters - our global variable - the object with arrays about what we are searching for.
	// projects - an object with the full projects list (from project.json).
	function renderFilterResults(filters, projects){

			// This array contains all the possible filter criteria.
		var criteria = ['tags'], //['capability-1','platform','tags'],
			results = [],
			isFiltered = false;

		// Uncheck all the checkboxes.
		// We will be checking them again one by one.
		checkboxes.prop('checked', false);


		criteria.forEach(function (c) {

			// Check if each of the possible filter criteria is actually in the filters object.
			if(filters[c] && filters[c].length){


				// After we've filtered the projects once, we want to keep filtering them.
				// That's why we make the object we search in (projects) to equal the one with the results.
				// Then the results array is cleared, so it can be filled with the newly filtered data.
				if(isFiltered){
					projects = results;
					results = [];
				}


				// In these nested 'for loops' we will iterate over the filters and the projects
				// and check if they contain the same values (the ones we are filtering by).

				// Iterate over the entries inside filters.criteria (remember each criteria contains an array).
				filters[c].forEach(function (filter) {
					console.log("filter " + filter);

					// Iterate over the projects.
					projects.forEach(function (item){

						// If the project has the same specification value as the one in the filter
						// push it inside the results array and mark the isFiltered flag true.

						if(typeof item.tags !== 'undefined' && item.tags !== null){
							console.log(item.tags);
							console.log($.inArray(filter, item.tags));
							if( $.inArray(filter, item.tags) !== -1 ) {
								results.push(item);
								isFiltered = true;
							}
						}
					});

					// Here we can make the checkboxes representing the filters true,
					// keeping the app up to date.
					if(c && filter){
						$('input[name='+c+'][value='+filter+']').prop('checked',true);
					}

					console.log(results);
				});
			}

		});

		// Call the renderProjectsPage.
		// As it's argument give the object with filtered projects.
		renderProjectsPage(results);
	}


	// Shows the error page.
	function renderErrorPage(){
		var page = $('.error');
		page.addClass('visible');
	}

	// Get the filters object, turn it into a string and write it into the hash.
	function createQueryHash(filters){

		// Here we check if filters isn't empty.
		if(!$.isEmptyObject(filters)){
			// Stringify the object via JSON.stringify and write it after the '#filter' keyword.
			window.location.hash = '#filter/' + JSON.stringify(filters);
		}
		else{
			// If it's empty change the hash to '#' (the homepage).
			window.location.hash = '#';
		}

	}

});