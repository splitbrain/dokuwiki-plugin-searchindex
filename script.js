/**
 * Javascript for searchindex manager plugin
 *
 * @author Andreas Gohr <andi@splitbrain.org>
 */

var pl_si = {

    // hold some values
    pages: null,
    page:  null,
    sack:  null,
    done:  1,
    count: 0,
    output: null,
    lang: null,

    /**
     * initialize everything
     */
    init: function(){
        pl_si.output = $('plugin__searchindex');
        if(!pl_si.output) return;

        pl_si.sack = new sack(DOKU_BASE + 'lib/plugins/searchindex/ajax.php');
        pl_si.sack.AjaxFailedAlert = '';
        pl_si.sack.encodeURIString = false;
        pl_si.lang = LANG.plugins.searchindex;

        // init interface
        pl_si.status('<button id="plugin__searchindex_btn" class="button">'+pl_si.lang.rebuild+'</button>');
        addEvent($('plugin__searchindex_btn'),'click',pl_si.go);
    },

    /**
     * Gives textual feedback
     */
    status: function(text){
        pl_si.output.innerHTML = text;
    },

    /**
     * Callback.
     * Executed when the index was cleared.
     * Starts the indexing
     */
    cb_clear: function(){
        var ok = this.response;
        if(ok == 1){
            // start indexing
            window.setTimeout(pl_si.index,1000);
        }else{
            pl_si.status(ok);
            // retry
            window.setTimeout(pl_si.clear,5000);
        }
    },

    /**
     * Callback.
     * Executed when the list of pages came back.
     * Starts the index clearing
     */
    cb_pages: function(){
        var data = this.response;
        pl_si.pages = data.split("\n");
        pl_si.count = pl_si.pages.length;
        pl_si.status(pl_si.lang.pages.replace(/%d/,pl_si.pages.length));

        // move the first page from the queue
        pl_si.page = pl_si.pages.shift();

        // start index cleaning
        window.setTimeout(pl_si.clear,1000);
    },

    /**
     * Callback.
     * Returned after indexing one page
     * Calls the next index run.
     */
    cb_index: function(){
        var ok = this.response;
        var wait = 500;
        if(ok == 1){
            // next page from queue
            pl_si.page = pl_si.pages.shift();
            pl_si.done++;
        }else{
            // something went wrong, show message
            pl_si.status(ok);
            wait = 5000;
        }
        // next index run
        window.setTimeout(pl_si.index,500);
    },

    /**
     * Starts the indexing of a page.
     */
    index: function(){
        if(pl_si.page){
            pl_si.status(pl_si.lang.indexing+' <b>'+pl_si.page+'</b> ('+pl_si.done+'/'+pl_si.count+')');
            pl_si.sack.onCompletion = pl_si.cb_index;
            pl_si.sack.URLString = '';
            pl_si.sack.runAJAX('call=indexpage&page='+encodeURI(pl_si.page));
        }else{
            // we're done
            pl_si.throbber_off();
            pl_si.status(pl_si.lang.done);
        }
    },

    /**
     * Cleans the index
     */
    clear: function(){
        pl_si.status(pl_si.lang.clearing);
        pl_si.sack.onCompletion = pl_si.cb_clear;
        pl_si.sack.URLString = '';
        pl_si.sack.runAJAX('call=clearindex');
    },

    /**
     * Starts the whole index rebuild process
     */
    go: function(){
        pl_si.throbber_on();
        pl_si.status(pl_si.lang.finding);
        pl_si.sack.onCompletion = pl_si.cb_pages;
        pl_si.sack.URLString = '';
        pl_si.sack.runAJAX('call=pagelist');
    },

    /**
     * add a throbber image
     */
    throbber_on: function(){
        pl_si.output.style['background-image'] = "url('"+DOKU_BASE+'lib/images/throbber.gif'+"')";
        pl_si.output.style['background-repeat'] = 'no-repeat';
    },

    /**
     * Stop the throbber
     */
    throbber_off: function(){
        pl_si.output.style['background-image'] = 'none';
    }
};

addInitEvent(function(){
    pl_si.init();
});


//Setup VIM: ex: et ts=4 enc=utf-8 :
