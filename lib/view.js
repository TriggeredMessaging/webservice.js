/*** simple internal view server ( for documentation ) ***/

var renderRoutes = exports.renderRoutes = function(format, name, items, template, omitPreamble) {
    //	console.log(util.inspect(request.originalUrl));

    /* 	edit (by rootnot)
     1. Now this function is called with response context (this refers to response object).
     2. Added inspection form with iframe containing output from called methods
     */
    if(format == 'json') {
        return JSON.stringify(items, true, 2);
    }
    if(format == 'html') {
        var html = '';

        if(!omitPreamble) {
            html += '<h1>' + items.title + '</h1>'
            html += '<h3>' + items.name + '</h3>';
            html += 'Version <i>' + items.version + '</i>';
            html += '<h3>Available Methods</h3>';
        }
        var baseUrl = items.endpoint || '';
        // iterate through each top-level method in the module and created a link
        for(var method in items.methods) {
            var m = items.methods[method];
            if(typeof m == 'string') {
                continue;
            }
            // if the module is private, ignore it
            if(m.private === true) {
                continue;
            }

            var path = baseUrl + "/" + method;

            //var path = this.url +  method;
            if(typeof m.regex !== 'undefined') {
                path = m.regex;
            }
            html += ('<div class="member grad">');
            html += ('<div class="header"><a href="' + path + '" target="_blank">' + path + '</a> <a href="#" class="toggle">Show</a></div>');

            html += ('<div class="allcontent">');
            html += ('<div class="content">');
            html += ('<div class="member grad">');
            html += ('<div class="sub header">' + m.description + '</div>');

            var sampleCurlArgs = '', sampleCurlJSON = {};

            // parse arguments
            if(m.schema) {

                sampleCurlArgs = "?";
                html += ('<div class="content"><strong>arguments:</strong> <br/>');
                var s = m.schema;
                for(var arg in s) {

                    // only generate sample curl syntax for required properties
                    if(s[arg].optional != true) {
                        sampleCurlArgs += (arg + "=val&");
                        sampleCurlJSON[arg] = "val";
                    }

                    html += (arg + ' ' + JSON.stringify(s[arg]) + '<br/>');
                }
                sampleCurlArgs = sampleCurlArgs.substr(0, sampleCurlArgs.length - 1);
                html += ('</div>');
            }

            // GET
            html += ('<div class="content">');
            html += ('<span class="verb">GET</span> <span class="url">/' + method + '<br>');
            html += ('<span class="curl">curl -X GET ' + items.endpoint + '/' + method + sampleCurlArgs + '</span><br/>');
            //html += ('<div class="descriptor">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/></div>');
            html += ('</span></div>');

            // POST
            html += ('<div class="content">');
            html += ('<span class="verb">POST</span> <span class="url">/' + method + '<br>');
            html += ('<span class="curl">curl -X POST -d "' + sampleCurlArgs.substr(1, sampleCurlArgs.length) + '" ' + items.endpoint + '/' + method + '</span><br/>');
            html += ('You can also post JSON...<br/>');
            html += ('<span class="curl">curl -X POST -d "' + JSON.stringify(sampleCurlJSON) + '" ' + items.endpoint + '/' + method + '</span><br/>');

            //html += ('<div class="descriptor">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/></div>');
            html += ('</span></div>');
            html += ('</div></div>');

            // form
            html += ('<div class="form">') + '\n';
            html += ('<form method="get" action="' + items.endpoint + '/' + method + '" target="' + method + '-output">') + '\n';
            for(var arg in s) {
                html += ('<div class="field">') + '\n';
                html += ('<label>' + arg + ': </label>') + '\n';
                html += ('<input type="text" id="' + method + '-' + arg + '" name="' + arg + '">') + '\n';
                html += ('</div>') + '\n';
            }
            html += ('<div class="button"><input type="submit"/></div>') + '\n';
            html += ('</form>') + '\n';
            html += ('<iframe class="response" name="' + method + '-output"> </iframe>') + '\n';
            html += ('</div>');

            html += ('<br/><span class="content">JSONP support is currently enabled. To use JSONP, append "&callback=mymethod" to any GET request</span>') + '\n';
            html += ('<br/><br/>') + '\n';

            html += ('</div>') + '\n';

            if(typeof m.methods === "object" || typeof m.methods === "function") {
                html += renderRoutes(format, 'a', m.methods, '{{body}}', true);
                if(Object.keys(m.methods).length) {
                }
            }

            html += ('</div>') + '\n';

            // + '/' + method + '</a> <i>' + (items[method].description || '') + ' </i>' + '</li>');
        }

        if(!omitPreamble) {
            html += '<h4>This page was auto-generated by <a href="http://github.com/marak/webservice.js" target="_blank">webservice.js</a></h4>'
        }
        return template.replace('{{body}}', html); // fake mustache
    }
    return 'error';
}

/*** simple html renderer for validator errors ***/
var renderValidatorErrors = exports.renderValidatorErrors = function(errors) {

    var html = '<h1>error(s) have occurred with your request!</h1>';

    errors.forEach(function(v, i) {

        html += "Argument Name:" + v.property + '<br/>';
        html += "Value:" + v.actual + '<br/>';
        html += "Expected:" + v.expected + '<br/>';
        //html += "Message:" + v.message + '<br/><br/>';
    });

    return html;
}