<?php
if(!defined('DOKU_INC')) define('DOKU_INC',realpath(dirname(__FILE__).'/../../../').'/');
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'admin.php');
 
/**
 * All DokuWiki plugins to extend the admin function
 * need to inherit from this class
 */
class admin_plugin_searchindex extends DokuWiki_Admin_Plugin {
 		var $cmd;

    /**
     * Constructor
     */
    function admin_plugin_searchindex(){
        $this->setupLocale();
    }

    /**
     * return some info
     */
    function getInfo(){
        return array(
            'author' => 'Andreas Gohr',
            'email'  => 'andi@splitbrain.org',
            'date'   => '2005-09-04',
            'name'   => 'Searchindex Manager',
            'desc'   => 'Allows to rebuild the fulltext search index',
            'url'    => 'http://wiki.splitbrain.org/plugin:searchindex',
        );
    }
 
    /**
     * return sort order for position in admin menu
     */
    function getMenuSort() {
        return 40;
    }
 
    /**
     * handle user request
     */
    function handle() {
    }
 
    /**
     * output appropriate html
     */
    function html() {
        print $this->plugin_locale_xhtml('intro');

        print '<fieldset class="pl_si_out">';
        
        print '<button class="button" id="pl_si_gobtn" onclick="plugin_searchindex_go()">';
        print $this->getLang('rebuild_index');
        print '</button>';
        print '<span id="pl_si_out"></span>';
        print '<img src="'.DOKU_BASE.'lib/images/loading.gif" id="pl_si_throbber" />';

        print '</fieldset>';
        
    }

 
}
//Setup VIM: ex: et ts=4 enc=utf-8 :
