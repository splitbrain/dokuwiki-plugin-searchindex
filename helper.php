<?php

use dokuwiki\Extension\Plugin;

/**
 * Helper component for searchindex plugin
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     Andreas Gohr <andi@splitbrain.org>
 */
class helper_plugin_searchindex extends Plugin
{
    /**
     * Get list of all pages
     *
     * @return string[] List of page IDs
     */
    public function getPagelist(): array
    {
        global $conf;
        $data = [];
        search($data, $conf['datadir'], 'search_allpages', []);

        return array_column($data, 'id');
    }

    /**
     * Clear all index files
     *
     * @return bool True on success
     */
    public function clearIndex(): bool
    {
        $indexer = idx_get_indexer();
        return $indexer->clear() !== false;
    }

    /**
     * Index the given page
     *
     * We're doing basically the same as the real indexer but ignore the
     * last index time here
     *
     * @param string $page Page ID to index
     * @param bool $force Force reindexing even if page hasn't changed
     * @return bool True on success
     */
    public function indexPage(string $page, bool $force = false): bool
    {
        if (!$page) {
            return false;
        }

        return idx_addPage($page, false, $force) !== false;
    }
}
