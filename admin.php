<?php

/**
 * DokuWiki Searchindex Manager
 * 
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     Andreas Gohr <andi@splitbrain.org>
 */
class admin_plugin_searchindex extends DokuWiki_Admin_Plugin
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
        echo $this->locale_xhtml('intro');

        echo '<div id="plugin__searchindex">';
        echo '<div class="buttons" id="plugin__searchindex_buttons">';
        echo '<input type="button" class="button" id="plugin__searchindex_rebuild" value="' . $this->getLang('rebuild') . '"/>';
        echo '<p>' . $this->getLang('rebuild_tip') . '</p>';
        echo '<input type="button" class="button" id="plugin__searchindex_update" value="' . $this->getLang('update') . '"/>';
        echo '<p>' . $this->getLang('update_tip') . '</p>';
        echo '</div>';
        echo '<div class="msg" id="plugin__searchindex_msg"></div>';
        echo '</div>';
    }
}
//Setup VIM: ex: et ts=4 enc=utf-8 :
