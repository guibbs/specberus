/*global io*/

// TODO:
//  include socket.io
//  grab on submit and cancel, get values
//  client-side protocol
//  history API and reacting to the QS on load (and filling out form)
//  show errors

(function ($) {
    var $url = $("#url")
    ,   $profile = $("#profile")
    ,   $alert = $("#alert")
    ,   $results = $("#results")
    ,   $resultsBody = $results.find("table")
    ,   $progress = $results.find(".progress-bar")
    ,   $progressLabel = $progress.find(".sr-only")
    ,   socket = io.connect(location.protocol + "//" + location.host)
    ;
    
    // handshake
    socket.on("handshake", function (data) {
        console.log("Using version", data.version);
        $(".navbar-brand small").remove();
        $("<small></small>")
            .css({ fontSize: "0.5em", opacity: "0.5" })
            .text(" (" + data.version + ")")
            .appendTo($(".navbar-brand"))
            ;
    });

    // show errors
    function showError (string) {
        $alert.clone()
              .find("span")
                .text(string)
              .end()
              .removeClass("hide")
              .insertAfter($alert);
    }

    // show progress
    function progress (done, total) {
        $progress.attr({
            "aria-valuenow":    done
        ,   "aria-valuemax":    total
        ,   "style":            "width: " + ((done/total)*100) + "%"
        });
        $progressLabel.text(done + "/" + total + " done.");
    }

    // validate
    function validate (url, profile) {
        $resultsBody.find("tr:not(.h)").remove();
        socket.emit("validate", {
            url:        url
        ,   profile:    profile
        });
    }
    
    // terminate validation
    function endValidation () {
        $progress.hide();
    }
    
    // handle results
    function row (id) {
        var $row = $("#" + id);
        if ($row.length) return $row;
        return $("<tr><td class='status'></td><td class='test'></td><td class='results'></td></tr>")
                    .find(".test")
                        .text(id)
                    .end()
            ;
    }
    var type2class = {
        warning:    "text-warning"
    ,   error:      "text-danger"
    };
    function addMessage ($row, type, msg) {
        var $ul = $row.find("ul." + type);
        if (!$ul.length) $ul = $("<ul></ul>").addClass(type);
        $("<li></li>")
            .addClass(type2class[type])
            .text(msg)
            .appendTo($ul);
    }
    
    // protocol
    socket.on("exception", function (data) {
        showError("Exception: " + data.message);
        endValidation();
    });
    socket.on("start", function () {
        progress(0, 0);
        $progress.show();
    });
    socket.on("ok", function (data) {
        row(data.name)
            .find(".status")
                .append("<span class='text-success'>\u2714 <span class='sr-only'>ok</span></span>")
            .end()
            .find(".results")
                .prepend("Ok")
            .end();
    });
    socket.on("warning", function (data) {
        addMessage(row(data.name), "warning", data.message);
    });
    socket.on("error", function (data) {
        var $row = row(data.name);
        addMessage(row(data.name), "error", data.message);
        $row
            .find(".status")
                .append("<span class='text-danger'>\u2718 <span class='sr-only'>fail</span></span>")
            .end();
    });
    socket.on("done", function () {
        endValidation();
    });

    // handle the form
    $("#options").submit(function () {
        var url = $url.val()
        ,   profile = $profile.val()
        ;
        if (!url) showError("Missing URL parameter.");
        if (!profile) showError("Missing profile parameter.");
        validate(url, profile);
        return false;
    });
    
}(jQuery));