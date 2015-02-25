/*
  GitHub XRef
  by Doug Martin (http://dougmart.in)
*/
(function(){
  var 
      // regex for splitting code lines
      splitRegex = /(\w+)/g,
      symbolRegex = /pl-((s\d)|vpf|en|vo|e|stj|v|smp)/,
  
      // helper to loop over any list
      forEach = function (list, cb) {
        for (var i = 0, j = list.length; i < j; i++) {
          cb(list[i], i);
        }
      },
      
      // helper to loop over the selector results
      forEachSelector = function (selector, cb) {
        forEach(document.querySelectorAll(selector), cb);
      },
      
      // helper to create an xref link
      createLink = function (text) {
        link = document.createElement('a');
        link.href = '#' + text;
        link.className = 'xref';
        link.appendChild(document.createTextNode(text));
        return (link);
      },
      
      // helper to determine if a node is an xref link
      isXref = function (e) {
        return ((e.target.nodeName === 'A') && (e.target.className.substr(0, 4) === 'xref'));
      },
      
      // cross-platform event adders
      addListener = function (el, event, cb) {
        if (el.addEventListener) {
          el.addEventListener(event, cb, false);
        }
        else {
          el.attachEvent("on" + event, cb);
        }
      },
      onEvent = function (event, cb) {
        addListener(document.body, event, cb);
      },
      
      // wait for the stylesheet to load before inserting the rule
      waitForStyleSheetLoad = function (cb) {
        var sheet = document.styleSheets.length > 0 ? document.styleSheets[0] : null;
        if (sheet) {  
          cb(sheet);
        }
        else {
          setTimeout(waitForStyleSheetLoad, 20);
        }
      },
      
      // do the xref on the code
      xref = function () {
        
        // link the symbols in the unmarked code 
        forEachSelector('.blob-code', function (code) {     
          forEach(code.childNodes, function (node) {
            var span;
            if (node.nodeType === 3) {
              span = document.createElement('span');
              forEach(node.nodeValue.split(splitRegex), function (text, i) {
                span.appendChild(i % 2 === 0 ? document.createTextNode(text) : createLink(text));
              });
              code.replaceChild(span, node);
            }
          });
        });
        
        // link the symbols marked outside of the code
        forEachSelector('span', function (span) {
          if (span.className.match(symbolRegex)) {
            forEach(span.childNodes, function (node) {
              if (node.nodeType === 3) {
                span.replaceChild(createLink(node.nodeValue), node);
              }
            });
          }
        });
      },
  
      // listen for title changes as a proxy for pjax page changes  
      listenForTitleChanges = function (cb) {
        var oldTitle = document.title,
            pollForChanges = function () {
              if (oldTitle !== document.title) {
                cb();
                oldTitle = document.title;
              }
            };
        
        if (WebKitMutationObserver) {
          (new WebKitMutationObserver(cb)).observe(
            document.querySelector('head > title'), 
            {subtree: true, characterData: true, childList: true}
          );
        }
        else {
          setInterval(pollForChanges, 10);
        }
      };

  // redirect clicks on xref links to the search form      
  onEvent('click', function (e) {
    var form = isXref(e) ? document.querySelector("form.js-site-search-form") : null;
    if (form) {
      e.preventDefault();
      e.stopPropagation();
      window.location = form.action + "?q=" + e.target.hash.substr(1);
    }
  });
  
  // add active highlights when hovering over xref links
  onEvent('mouseover', function (e) {
    if (isXref(e)) {
      forEachSelector('a.active-xref', function (link) {
        link.className = 'xref';
      });
      forEachSelector('a.xref[href="' + e.target.hash + '"]', function (link) {
        link.className = 'xref active-xref';
      });
    }  
  });

  // remove active highlights after moving out of xref links  
  onEvent('mouseout', function (e) {
    if (isXref(e)) {
      forEachSelector('a.active-xref', function (link) {
        link.className = 'xref';
      });
    }  
  }); 

  // do the initial xref
  xref();
  
  // wait for the style sheet to load before adding the custom style
  waitForStyleSheetLoad(function (sheet) {
    if (sheet.insertRule) {
      sheet.insertRule("a.active-xref { background-color: rgba(255,255,140,0.75); }", 0);
    }
    else {
      sheet.addRule("a.active-xref", "background-color: rgba(255,255,140,0.75);", 0);
    }
  });
  
  // listen for changes on the page from pjax usage and redo the xref when changed
  listenForTitleChanges(function () {
    xref();
  });
  
})(); 