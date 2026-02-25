<?php
/**
 * Plugin Name: Nabil Live Chat
 * Description: Un plugin de chat en direct (type Tawk.to) pour communiquer avec vos visiteurs en temps réel.
 * Version: 1.1.1
 * Author: Nabil Asad
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'NLC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NLC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'NLC_VERSION', '1.1.1' );

if ( is_admin() ) {
    require_once NLC_PLUGIN_DIR . 'admin/settings-page.php';
}
require_once NLC_PLUGIN_DIR . 'frontend/widget-injector.php';

register_activation_hook( __FILE__, 'nlc_activate' );
function nlc_activate() {
    add_option( 'nlc_server_url', 'http://localhost:3000' );
    add_option( 'nlc_primary_color', '#6366f1' );
}
