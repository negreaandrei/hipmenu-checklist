/* ========================================================================
 * Section
 * ======================================================================== */

document.addEventListener('DOMContentLoaded', function() {

      // get orders from page

    chrome.tabs.executeScript(null, {
        code: "\
      var orders = [], iterator, tags, dinerNameDOMElement, dinerName, priceValueDOMElement, priceValue;\
      if (document.location.hash.startsWith('#history')) {\
        tags = document.querySelectorAll('.history-item')[0].querySelectorAll('.content');\
        if (tags.length == 0) {\
        tags = document.querySelectorAll('.history-diners')[0].querySelectorAll('.content');\
    }\
\
    for (iterator = 0; iterator < tags.length; iterator++) {\
        dinerNameDOMElement = tags[iterator].querySelector('h4');\
        dinerName = dinerNameDOMElement.innerText.trim();\
\
        priceValueDOMElement = tags[iterator].querySelector('.simple-footer');\
        if (priceValueDOMElement != null) {\
            priceValue = priceValueDOMElement.innerHTML.trim();\
            priceValue = priceValue.replace('Total ' + dinerName + ': ', '');\
        } else {\
            priceValueDOMElement = tags[iterator].querySelector('footer').querySelectorAll('td');\
            priceValueDOMElement = priceValueDOMElement[priceValueDOMElement.length - 1];\
            priceValue = priceValueDOMElement.innerHTML.trim();\
        }\
        orders.push({\
            name: dinerName,\
            price: priceValue\
        });\
    }\
    } else {\
        var name_tags = document.querySelectorAll('h1');\
        var price_tags = document.querySelectorAll('div.price');\
        for (iterator = 0; iterator < name_tags.length; iterator++) {\
            orders.push({\
                name: name_tags[iterator].innerText.trim(),\
                price: price_tags[iterator].innerText.trim()\
            });\
        }\
    }\
    JSON.stringify(orders);\
    "
    }, function(orders) {
        var html = '', iterator, iteratorChecks, checks, dinerName, pageURL, dinerKey;

        orders = JSON.parse(orders);
        if (orders.length == 0) {
            return;
        }
        orders.sort(function(a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });

        chrome.tabs.executeScript(null, {
            code: "document.location.hash"
        }, function(data) {
            pageURL = data;

            // render the checklist
            for (iterator = 0; iterator < orders.length; iterator++) {
                html = html + '<tr>';
                html = html + '<td><label for="check' + iterator + '">' + orders[iterator].name + '</label></td>';
                html = html + '<td><label for="check' + iterator + '">' + orders[iterator].price + '</label></td>';
                html = html + '<td><input id="check' + iterator + '" type="checkbox" data-name="' + orders[iterator].name + '"' + (orders[iterator].payed ? ' checked ' : '') + '></td>';
                html = html + '</tr>';
            }
            document.querySelector('tbody').innerHTML = html;

            checks = document.querySelectorAll('td input');
            for (iteratorChecks = 0; iteratorChecks < checks.length; iteratorChecks++) {
                checks[iteratorChecks].addEventListener('click', function() {
                    dinerName = this.getAttribute('data-name');
                    dinerKey = dinerName + ":url:" + pageURL;
                    for (iterator = 0; iterator < orders.length; iterator++) {
                        if (orders[iterator].name == dinerName) {
                            orders[iterator].payed = this.checked;
                            chrome.tabs.executeScript(null, {
                                code: "sessionStorage.setItem('" + dinerKey + "', " + this.checked + ")"
                            });
                        }
                    }
                });
            }

            // get checkbox statuses from parent page

            for (iterator = 0; iterator < orders.length; iterator++) {
                dinerKey = orders[iterator].name + ":url:" + pageURL;

                chrome.tabs.executeScript(null, {
                    code: iterator.toString() + " + ':' + sessionStorage.getItem('" + dinerKey + "')"
                }, function(data) {
                    data = data[0].split(':');
                    var index = parseInt(data[0]);
                    var value = data[1] == 'true';
                    orders[index].payed = value;
                    document.querySelector('input[data-name="' + orders[index].name + '"]').checked = value;
                });
            }
        });
    });
});

/* ========================================================================
 * Section
 * ======================================================================== */
