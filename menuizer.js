/**
 * Place your JS-code here. MenuPlugin
 * WRITTEN BY: Mattis Andersson
 */
$(document).ready(function(){
  'use strict';
  
  // A self invoking anounymous function that takes a parameter $ and sends the jQuery object as an argument to make sure that $ truly means jQuery
  (function($) {
	
	$.fn.menuize = function(options){
			var $this = $(this);
			
			options = $.extend({}, $.fn.menuize.defaults, options);
			
			// to make sure that the input is in the format that we expect, that is boolean not string
			if(options.useAjax === "true" || options.useAjax){
				options.useAjax = true;
			}else{
				options.useAjax = false;
			}
			
			if(options.redirectOnVoid === "true" || options.redirectOnVoid){
				options.redirectOnVoid = true;
			}else{
				options.redirectOnVoid = false;
			}
			
			
			if($this.attr("id") == undefined || $this == null){
				console.log("WARNING: no valid element has been passed, can not menuize null/undefined");
				return;
			}
			
			if($(this).attr("id") !== undefined && options.divId === $.fn.menuize.defaults.divId){
				console.log("reading new id and class attributes");
				options.divId = $(this).attr("id");
			}
			
			if($(this).attr("class") !== undefined && options.divClass === $.fn.menuize.defaults.divClass){
				options.divClass = $(this).attr("class");
			}
			
			if(options.autoCorrect === "true" || options.autoCorrect === true){
				// find and fix the errors
				checkAndFixHTML($this, options);
			}
			
			if(options.useAjax === "true" || options.useAjax === true){
				$("#" + options.divId + "." + options.divClass + " li a,#" + options.divId + "." + options.divClass + " li img").on(options.event, function(e){
					var temp = $(this);
					handleMenuAjax(options, temp, e);
				}); // must use anonymous function here to be able to pass parameter to the event handler
			}else{
				$("#" + options.divId + "." + options.divClass + " li a,#" + options.divId + "." + options.divClass + " li img").on(options.event, function(e){
					var temp = $(this);
					handleMenu(options, temp, e);
				});
			}
			
			return this; // THIS MIGHT BE UNECESSARY AS THERE ARE NO OTHER FUNCTIONS TO BE USED ON IT
		}
	
	/**
	 ******** IMPORTANT ******** IF AUTOCORRECT == TRUE THEN THE PLUGIN CHANGES THE ID OF THE PARENT ELEMENT AND THIS COULD DESTROY CSS
	 ******* ALSO ************** IF USING AJAX TO LOAD A PAGE WITH LINKS THE LINKS WILL NOT USE AJAX UNLESS SPECIFIED INSIDE THE PAGE CODE
	 * "event" specifies what kind of event should trigger the menu handling code to be used, eg. "click", "hover" etc(uses jquery events)element specifik
	 * "divId" is the id of the <div> element to be set as the parent element to be used, if left untouched the id of the element passed will be used
	 * "divClass" is the class of the <div> elements to show what css to be used and to show which <li> and <ul> elements belong together when they are in divs
	 * "nonItem" is a value to be used to specify that an menu item should not be able to be triggered
	 * "useAjax" specifies whether or not AJAX should be used when handling to handle the menu events
	 * "ajaxLoadDiv" is the id of the div into which the AJAX loaded page should be loaded
	 * "redirectOnVoid" is a boolean that specifies whether or not to redirect when a link contains "javascript:void(0)"(NON AJAX ONLY)
	 * "autoCorrect" is a boolean that specifies whether or not to try and fix the elements in the menu if they are not correctly specified
	 
	 * "useExtension" is a boolean that specifies whether or not to use the pageExtension, if false all extension must be entered in data-url/id/src
	 
	 * "pageExtension" is value that specifies what extension should be used in the places where extension/values are missing / implied
	 * "imageExtension" is value that specifies what extension should be used in the places where there is no src attribute for an img element
	 * "defaultMissingPageUrl" is url to the page to be used when no information is available on where to go, on non-ajax specify as "" to use default instead
	 * "ajaxCallbackFunction" this is the function that will be called when menuizer are done or have failed loading the specified page(AJAX ONLY)
	 */
	$.fn.menuize.defaults = {"event":"click", "divId":"navigation", "divClass":"menuContainer", "nonItem":"UnClickable",
		"useAjax":"false", "ajaxLoadDiv":"ajaxDiv", "redirectOnVoid":"true", "autoCorrect":"true", "useExtension":"true", "pageExtension":"php",
		"imageExtension":"png", "defaultMissingPageUrl":"error.php", "ajaxCallbackFunction":defaultAjaxCallback}
	
	
	/**
	 * Function that checks the code to see so that it follows the necessary format
	 * $this - is the reference to the div that is suppose to hold the menu
	 */
	function checkAndFixHTML($this, options){
		// Check html here
		var temp = document.getElementById($this.attr("id"));
		
		if(temp.nodeName != "DIV"){ // REMOVE
			console.log("WARNING: outer element in menu is not a div, this can cause problems on autocorrection"); // <a> = "A", <ul> = "UL", <div> = "DIV"
		}
		
		if($this.children()[0].nodeName == "UL"){
			checkAndFixUl(temp.childNodes[1], options);
		}else{
			console.log("ERROR: you appear to be missing an outer <ul> element inside your menu containing div(" + $this.attr("id") + "), make sure that " +
			"you do not have any other elements between the <div> and the <ul>, aborting autocorrection");
		}
		
	}
	
	/**
	 * Helper-function that checks the codes <ul> elements to see so that they follow the necessary format
	 * $this - is the reference to a ul that is part of the menu
	 */
	function checkAndFixUl($this, options){
		var children = $this.childNodes;
		
		if(!$this.hasAttribute("id")){
			console.log("NOTE: one of your <ul>-elements seem to be missing an id");
		}
		
		if(!$this.hasAttribute("class")){
			console.log("WARNING: one of your <ul>-elements seem to be missing an class, setting class navigation");
			$this.setAttribute("class", "navigation");
		}else if($this.getAttribute("class") != "navigation"){
			console.log("WARNING: one of your <ul>-elements seems to be having the wrong class, setting class navigation");
			$this.setAttribute("class", "navigation");
		}
		
		if(children.length <= 0){
			console.log("WARNING: one of your <ul>-elements seem to be missing children");
		}
		
		for(var kid in children){
			if(children[kid].nodeName == "LI"){
				checkAndFixLi(children[kid], options);
			} else if(children[kid].nodeName == "#text" || children[kid].nodeName == undefined || children[kid].nodeName == "BR"){
				// console.log("one child of <ul> is not an <li>: " + children[kid].nodeName + " " + children[kid].nextElementSibling);
			} else{
				console.log("NOTE: one of your <ul>-elements contain an child-element that is not an accepted element-type: " + children[kid].nodeName);
			}
		}
	}
	
	/**
	 * Helper-function that checks the <li> elements to see so that they follow the necessary format and have the correct information
	 * $this - is the reference to a li that is part of the menu
	 * returns false if something is severly wrong and can't be fixed, this should propogate back
	 */
	function checkAndFixLi($this, options){
		var children = $this.childNodes;
		
		if(children.length <= 0){
			// the <li> element does not contain any information at all...
			console.log("WARNING: one of your <li>-elements does not contain any information at all");
		}
		
		for(var kid in children){
			if(children[kid].nodeName == "#text" || children[kid].nodeName == undefined){
				// perhaps do something here
			} else if(children[kid].nodeName == "A"){ // check here for what element this is and if it is one that is allowed/make sense
				checkAndFixAnchor(children[kid], options);
			}else if(children[kid].nodeName == "IMG"){
				console.log("fixing img element");
				checkAndFixImg(children[kid], options);
			} else if(children[kid].nodeName == "UL"){
				checkAndFixUl(children[kid], options);
			}else{
				console.log("WARNING: one child is an unknown/not allowed type: " + children[kid].nodeName + " removes it");
				children[kid].parentNode.removeChild(children[kid]); // has to use this ugly solution for internet explorer
				// children[kid].remove(); // if one wants to keep the data and events, use .detach() instead
			}
		}
	}
	
	/**
	 * Helper-function that checks the code to see so that it follows the necessary format
	 * $this - is the reference to a <a> that is part of the menu
	 */
	function checkAndFixAnchor($this, options){
		var siblings = $this.parentNode.childNodes, id = $this.getAttribute("id");
		
		for(var sibling in siblings){
			if(siblings[sibling].nodeName == "UL"){
				// make this unclickable
				$this.setAttribute("data-clickable", options.nonItem);
				console.log("NOTE: makes the following anchor-element unclickable");
				console.log($this);
				if(id != null && id != "null"){
					$this.setAttribute("id", id + options.nonItem);
				}else{
					$this.setAttribute("id", options.nonItem);
				}
			}
		}
		
		
		if($this.hasAttribute("href")){
			return true;
		} else{
			if($this.hasAttribute("id")){
				if(options.pageExtension != ""){
					console.log("WARNING: one of your anchors(<a>-element) is missing a href, using \"id\" . options.pageExtension instead");
					$this.setAttribute("href", $this.getAttribute("id") + "." + options.pageExtension);
				} else{
					console.log("WARNING: one of your anchors(<a>-element) is missing a href, using \"id\" instead");
					$this.setAttribute("href", $this.getAttribute("id"));
				}
			} else{
				console.log("WARNING: one of your anchors(<a>-element) is missing a href and id, setting javascript:void(0);");
				$this.setAttribute("href", "javascript:void(0);");
			}
		}
	}
	
	/**
	 * Helper-function that checks the code to see so that it follows the necessary format
	 * $this - is the reference to a <img> that is part of the menu
	 */
	function checkAndFixImg($this, options){
		var siblings = $this.parentNode.childNodes, id = $this.getAttribute("id");
		
		for(var sibling in siblings){
			if(siblings[sibling].nodeName == "UL"){
				// make this unclickable
				$this.setAttribute("data-clickable", options.nonItem);
				console.log("NOTE: makes the following image-element unclickable");
				console.log($this);
				if(id != null && id != "null"){
					$this.setAttribute("id", id + options.nonItem);
				}else{
					$this.setAttribute("id", options.nonItem);
				}
			}
		}
		
		if($this.hasAttribute("src")){ // && $this.getAttribute("src") != ""
			return true;
		} else{
			if($this.hasAttribute("id")){
				console.log("WARNING: one of your image-elements(<img>-element) is missing a src, using \"id\" . options.imageExtension instead");
				$this.setAttribute("src", $this.getAttribute("id") + "." + options.imageExtension);
			} else{
				console.log("WARNING: one of your image-elements(<img>-element) is missing a src and id, sets an broken img link");
				$this.setAttribute("src", "javascript:void(0);");
			}
		}
	}
	
	
	/**
	 * Function that handles the normal menus, ergo no ajax handling, it should follow the specified links if they exist
	 */
	function handleMenu(options, $this, event){
		var href = $this.attr("href"), elemId = $this.attr("id"), elemUrl = $this.data("url"), elemSrc = $this.attr("src");
		
		if($this.data("clickable") == options.nonItem || startsOrEndsWith($this.attr("id"), options.nonItem)){ // checks if clickable element
			event.preventDefault(); // should not be able to click that
			return;
		}
		
		$("#" + options.divId + "." + options.divClass + " li a,#" + options.divId + "." + options.divClass + " li img").removeClass("selected");
		
		$this.addClass("selected");
		
		// checks here if the href part is javascript:void(0);... if it is then does a redirect to the id of the pressed link.options.pageExtension
		if(startsWith(href, "javascript:void(0)") && options.redirectOnVoid == true){
			if(elemUrl != null && elemUrl != undefined){
				if(options.pageExtension != ""){
					// performs redirect to the data-url + .options.pageExtension specified for the pressed element
					window.location.href = elemUrl + "." + options.pageExtension;
				} else{
					window.location.href = elemUrl;
				}
			} else if(elemId != null && elemId != undefined){
				if(options.pageExtension != ""){
					// performs redirect to the id + .options.pageExtension specified for the pressed element
					window.location.href = elemId + "." + options.pageExtension; // window.location.replace(elemId + ".php"); this
					// is preferable over window.location.href = "url", because the second one can cause the inability to go back
				} else{
					window.location.href = elemId;
				}
			} else if(elemSrc != null && elemSrc != undefined){
				// performs redirect to the src(if img which should also contain an extension) specified for the pressed element
				window.location.href = elemSrc;
			} else if(options.defaultMissingPageUrl != ""){
				window.location.href = options.defaultMissingPageUrl;
			}
		}
	}
	
	/**
	 * Function that handles the AJAX menus
	 *** SIDENOTE: Remember not to use $(this) where you mean $this
	 */
	function handleMenuAjax(options, $this, event){
		event.preventDefault();
		var imgElement, imgSrc;
		
		console.log("handling ajax request: " + options.divId);
		// checks if the id contains a prefix/postfix aswell.... for older browsers that don't support HTML5
		if($this.data("clickable") != options.nonItem && !startsOrEndsWith($this.attr("id"), options.nonItem)){ // checks if clickable element
			$("#" + options.divId + "." + options.divClass + " li a,#" + options.divId + "." + options.divClass + " li img").removeClass("selected");
			$this.addClass("selected");
			
			// if $this.data("url") is undefined then try to use $this.attr("id") instead, possibly even try to use src if the other two are unavailable
			if($this.data("url") != undefined && $this.data("url") != null){
				if(options.pageExtension != ""){
					$("#" + options.ajaxLoadDiv).load($this.data("url") + "." + options.pageExtension, function(response, status, xhr){
						options.ajaxCallbackFunction(response, status, xhr, options);
					});
				} else{
					$("#" + options.ajaxLoadDiv).load($this.data("url"), function(response, status, xhr){
						options.ajaxCallbackFunction(response, status, xhr, options);
					});
				}
			} else if($this.attr("id") != undefined && $this.attr("id") != null){
				if(options.pageExtension != ""){
					$("#" + options.ajaxLoadDiv).load($this.attr("id") + "." + options.pageExtension, function(response, status, xhr){
						options.ajaxCallbackFunction(response, status, xhr, options);
					});
				} else{
					$("#" + options.ajaxLoadDiv).load($this.attr("id"), function(response, status, xhr){
						options.ajaxCallbackFunction(response, status, xhr, options);
					});
				}
			} else if($this.attr("href") != undefined && $this.attr("href") != null && !startsWith($this.attr("href"), "javascript:void(0)")){
				$("#" + options.ajaxLoadDiv).load($this.attr("href"), function(response, status, xhr){
					options.ajaxCallbackFunction(response, status, xhr, options);
				});
			}else if($this.attr("src") != undefined && $this.attr("src") != null){ // TODO: CHECK SRC BEFORE ID?
				imgSrc = $this.attr("src");
				
				// checks so no img element with this id already exists
				if(document.getElementById("dynamicImageId" + options.divId) != null){
					// if it exist check if the src attribute is the same
					if($("#dynamicImageId" + options.divId).attr("src") != imgSrc){
						$("#dynamicImageId" + options.divId).attr("src", imgSrc);
					}
				}else{
					// clear the ajaxLoadDiv before appending image so that previous page is not lingering
					$("#" + options.ajaxLoadDiv).empty();
					
					imgElement = $("<img></img>").attr({id:"dynamicImageId" + options.divId, src:imgSrc});
					$("#" + options.ajaxLoadDiv).append(imgElement);
				}
			} else{
				$("#" + options.ajaxLoadDiv).load(options.defaultMissingPageUrl, function(response, status, xhr){
						options.ajaxCallbackFunction(response, status, xhr, options);
					});
			}
		}else{
			console.log("NOTE: that item is set as non clickable");
		}
	}
	
	/**
	 * Returns true if the text contained within the variable "checkText" contains the word contained within the variable "startWord"
	 */
	function startsWith(checkText, startWord){
		if(checkText.indexOf(startWord) == 0){
			return true;
		} else{
			return false;
		}
	}
	
	/**
	 * Returns true if the text contained within the variable "checkText" ends with the word contained within the variable "endWord"
	 */
	function endsWith(checkText, endWord){
		if(checkText.indexOf(endWord) != -1 && checkText.indexOf(endWord) == (checkText.length - endWord.length)){
			return true;
		} else{
			return false;
		}
	}
	
	/**
	 * Returns true if the text contained within the variable "checkText" starts or ends with the word contained within the variable "checkWord"
	 */
	function startsOrEndsWith(checkText, checkWord){
		if(checkText == undefined || checkText == null || checkWord == undefined ||checkWord == null){ //one or more of the parameters does not contain any data
			return false;
		}
		
		if(startsWith(checkText, checkWord) || endsWith(checkText, checkWord)){
			return true;
		} else{
			return false;
		}
	}
	
	
	/**
	 * The default callback function for the ajax part of the menu
	 */
	function defaultAjaxCallback(response, status, xhr, options){
		console.log("ajax callback " + status);
		if(status === "error"){
			$("#" + options.ajaxLoadDiv).html("Could not load the requested resource, double check so that the id etc. is correct and that the resource exist");
		}
	}
	
  }) (jQuery); //////////////////////////// end of plugin function ////////////////////
  
  
  // $("#navigation").menuize();
  // $("#menu1").menuize({"useAjax":true, "event":"mouseleave", "autoCorrect":"true"});
  // $("#menu3").menuize({"useAjax":true, "event":"click", "autoCorrect":"true", "ajaxLoadDiv":"secondAjaxDiv"});
  // $("#errorMenu").menuize({"useAjax":true, "event":"click", "autoCorrect":"true", "ajaxLoadDiv":"secondAjaxDiv", "nonItem":"testingItOut",
			// "pageExtension":""});
  console.log('Everything is ready.');  
  
});
