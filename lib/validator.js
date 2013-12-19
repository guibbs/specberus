
(function (global) {
    "use strict";
    
    var Specberus = function (options) {
        this.loader = options.loader;
        this.css = options.css;
    };
    Specberus.prototype.validate = function (options) {
        // accepted options:
        //  - url: URL for a document to load
        //  - source: source of a document to parse
        //  - file: file name of a document to load
        //  - document: the document, directly available
        //  - profile: the profile against which to validate
        //  - events: where to send the various events
        if (!options.events) throw new Error("The events option is required for reporting.");
        if (!options.profile) throw("Without a profile there is nothing to check.");
        var sink = options.events
        ,   profile = options.profile
        ;
        var doValidation = function (err, doc) {
            if (err) throw new Error(err);
            sink.emit("start-all", profile.name);
            for (var i = 0, n = profile.rules.length; i < n; i++) {
                var rule = profile.rules[i];
                rule.check(doc, this.css, sink);
            }
            // XXX need to check that all rules reply to send end-all
            // look at how mocha handles that
        };
        if (options.url) this.loader.loadURL(options.url, doValidation);
        else if (options.source) this.loader.loadSource(options.source, doValidation);
        else if (options.file) this.loader.loadFile(options.file, doValidation);
        else if (options.document) this.loader.loadDocument(options.document, doValidation);
    };
    
    global.Specberus = Specberus;
}(exports || window));