<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_enqueue_scripts', 'nlc_enqueue_assets' );
add_action( 'admin_enqueue_scripts', 'nlc_enqueue_admin_assets' );

function nlc_enqueue_assets() {
    // Force update the URL if it's still local or old
    $current_url = get_option('nlc_server_url');
    if (!$current_url || strpos($current_url, 'localhost') !== false || strpos($current_url, 'chatt-bot-serveur') !== false) {
        update_option( 'nlc_server_url', 'https://asad-chat-server.onrender.com' );
    }
    
    wp_enqueue_style( 'nlc-css', NLC_PLUGIN_URL . 'frontend/assets/css/widget.css', [], NLC_VERSION );
    // Upgrade Socket.io to 4.8.0 for better compatibility with server 4.8.3
    wp_enqueue_script( 'nlc-socket-io', 'https://cdn.socket.io/4.8.0/socket.io.min.js', [], '4.8.0', false );
    wp_enqueue_script( 'nlc-js', NLC_PLUGIN_URL . 'frontend/assets/js/widget.js', ['nlc-socket-io'], NLC_VERSION, true );
}

function nlc_enqueue_admin_assets( $hook ) {
    // On ne charge que sur notre page de réglages pour ne pas polluer l'admin
    if ( $hook !== 'toplevel_page_nlc-settings' ) return;
    
    nlc_enqueue_assets();
}

add_action( 'wp_footer', 'nlc_footer' );
add_action( 'admin_footer', 'nlc_footer' );

function nlc_footer() {
    $url = get_option( 'nlc_server_url', 'http://localhost:3000' );
    $color = get_option( 'nlc_primary_color', '#00b06b' );
    
    echo '<script>var nlc_config = { server_url: "' . esc_js( $url ) . '", primary_color: "' . esc_js( $color ) . '" };</script>';
    echo '<div id="nlc-widget-container"></div>';
}
