/* See license.txt for terms of usage */

define([
    "firebug/firebug",
    "firebug/lib/trace",
    "firebug/debugger/script/sourceFile",
    "firebug/chrome/reps",
],
function(Firebug, FBTrace, SourceFile, FirebugReps) {

"use strict"

// ********************************************************************************************* //
// Constants

var Cc = Components.classes;
var Ci = Components.interfaces;

var TraceError = FBTrace.to("DBG_ERRORS");
var Trace = FBTrace.to("DBG_ERRORLOG");

// ********************************************************************************************* //
// ErrorMessageObj Implementation

/**
 * @object This object collects data about an error that happens in the content. It's used
 * by {@ErrorMessage} Domplate template as the data source.
 */
function ErrorMessageObj(message, href, lineNo, source, category, context,
    trace, msgId, colNumber)
{
    this.message = message;
    this.href = href;
    this.lineNo = lineNo;
    this.source = source;
    this.category = category;
    this.context = context;
    this.trace = trace;
    this.msgId = msgId || this.getId();
    this.colNumber = colNumber;
}

ErrorMessageObj.prototype =
{
    getSourceLine: function(callback)
    {
        if (this.source)
            return this.source;

        var sourceFile = SourceFile.getSourceFileByUrl(this.context, this.href);
        if (!sourceFile)
        {
            TraceError.sysout("errorMessageObj.getSourceLine; ERROR no source file for " + 
                this.href);
            return;
        }

        this.sourceLoading = true;

        var self = this;
        sourceFile.getLine(this.lineNo - 1, function(line)
        {
            self.sourceLoading = false;
            self.source = line;

            if (callback)
                callback(line);
        });
    },

    resetSource: function()
    {
        if (this.href && this.lineNo != null)
            this.source = this.getSourceLine();
    },

    correctWithStackTrace: function(trace)
    {
        var frame = trace.frames[0];
        if (frame)
        {
            this.href = frame.href;
            this.lineNo = frame.line;
            this.trace = trace;
        }
    },

    correctSourcePoint: function(sourceName, lineNumber)
    {
        this.href = sourceName;
        this.lineNo = lineNumber;
    },

    getId: function()
    {
        return this.href + ":" + this.message + ":" + this.lineNo + ":" +
            (this.colNumber ? this.colNumber : "");
    }
};

// ********************************************************************************************* //
// Registration

// xxxHonza: back compatibility
FirebugReps.ErrorMessageObj = ErrorMessageObj;

return ErrorMessageObj;

// ********************************************************************************************* //
});
