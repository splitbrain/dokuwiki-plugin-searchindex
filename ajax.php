<?php
/**
 * AJAX call handler for searchindex plugin
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     Andreas Gohr <andi@splitbrain.org>
 */

use dokuwiki\Search\Indexer;

//fix for Opera XMLHttpRequests
if (!count($_POST) && $HTTP_RAW_POST_DATA) {
    parse_str($HTTP_RAW_POST_DATA, $_POST);
}

if (!defined('DOKU_INC')) define('DOKU_INC', realpath(dirname(__FILE__).'/../../../').'/');
require_once(DOKU_INC.'inc/init.php');

//close session
session_write_close();

header('Content-Type: text/plain; charset=utf-8');

//we only work for admins!
if (auth_quickaclcheck($conf['start']) < AUTH_ADMIN) {
    die('access denied');
}

//call the requested function
$call = 'ajax_'.$_POST['call'];
if (function_exists($call)) {
    $call();
} else {
    print "The called function '".htmlspecialchars($call)."' does not exist!";
}

/**
 * Searches for pages
 *
 * @author Andreas Gohr <andi@splitbrain.org>
 */
function ajax_pagelist()
{
    global $conf;
    $data = array();
    search($data, $conf['datadir'], 'search_allpages', array());

    foreach ($data as $val) {
        print $val['id']."\n";
    }
}

/**
 * Clear all index files
 */
function ajax_clearindex()
{
    global $conf;
    // keep running
    @ignore_user_abort(true);

    if (is_callable('dokuwiki\Search\Indexer::getInstance')) {
        $Indexer = Indexer::getInstance();
    } elseif (class_exists('Doku_Indexer')) {
        $Indexer = idx_get_indexer();
    } else {
       // Failed to clear index. Your DokuWiki is older than release 2011-05-25 "Rincewind"
       exit;
    }

    if (is_callable([$Indexer, 'clear'])) {
        $success = $Indexer->clear();
    } else {
       // Failed to clear index. Your DokuWiki is older than release 2013-05-10 "Weatherwax"
        $success = false;
    }

    print ($success !== false) ? 'true' : '';
}

/**
 * Index the given page
 *
 * We're doing basicly the same as the real indexer but ignore the
 * last index time here
 */
function ajax_indexpage()
{
    global $conf;
    $force = false;

    if (!$_POST['page']) {
        print 0;
        exit;
    }
    if (isset($_POST['force'])) {
        $force = $_POST['force'] == 'true';
    }

    // keep running
    @ignore_user_abort(true);

    if (is_callable('dokuwiki\Search\Indexer::getInstance')) {
        $Indexer = Indexer::getInstance();
        $success = $Indexer->addPage($_POST['page'], false, $force);
    } elseif (class_exists('Doku_Indexer')) {
        $success = idx_addPage($_POST['page'], false, $force);
    } else {
       // Failed to index the page. Your DokuWiki is older than release 2011-05-25 "Rincewind"
       exit;
    }

    print ($success !== false) ? 'true' : '';
}

