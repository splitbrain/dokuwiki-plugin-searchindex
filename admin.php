<?php

use dokuwiki\Extension\AdminPlugin;

/**
 * DokuWiki Searchindex Manager
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     Andreas Gohr <andi@splitbrain.org>
 */
class admin_plugin_searchindex extends AdminPlugin
{
    /**
     * return sort order for position in admin menu
     */
    public function getMenuSort()
    {
        return 40;
    }

    /**
     * handle user request
     */
    public function handle()
    {
    }

    /**
     * output appropriate html
     */
    public function html()
    {
        $this->setupLocale();
        echo $this->locale_xhtml('intro');
        echo '<searchindex-manager id="plugin__searchindex"' .
            ' lang="' . htmlspecialchars(json_encode($this->lang)) . '"' .
            ' url="' . DOKU_BASE . 'lib/plugins/searchindex/ajax.php"' .
            '></searchindex-manager>';
    }
}
