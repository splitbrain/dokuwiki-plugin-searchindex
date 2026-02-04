/**
 * Lazy-loader for searchindex manager web component
 *
 * @author Andreas Gohr <andi@splitbrain.org>
 */

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('searchindex-manager')) {
        import(DOKU_BASE + 'lib/plugins/searchindex/SearchIndexManager.js');
    }
});
