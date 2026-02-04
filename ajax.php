<?php

/**
 * AJAX call handler for searchindex plugin
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     Andreas Gohr <andi@splitbrain.org>
 */

if (!defined('DOKU_INC')) define('DOKU_INC', realpath(__DIR__ . '/../../../') . '/');
require_once(DOKU_INC . 'inc/init.php');
session_write_close();
header('Content-Type: application/json; charset=utf-8');
@ignore_user_abort(true);

// we only work for admins!
if(!auth_isadmin()) throw new Exception('access denied');

/** @var helper_plugin_searchindex $helper */
$helper = plugin_load('helper', 'searchindex');
global $INPUT;

switch($INPUT->post->str('call')) {
    case 'pagelist':
        echo json_encode($helper->getPagelist());
        break;
    case 'clearindex':
        echo json_encode($helper->clearIndex());
        break;
    case 'indexpage':
        $page = $INPUT->post->str('page');
        $force = $INPUT->post->bool('force');
        echo json_encode($helper->indexPage($page, $force));
        break;
    default:
        throw new \Exception('The called function does not exist!');
}
