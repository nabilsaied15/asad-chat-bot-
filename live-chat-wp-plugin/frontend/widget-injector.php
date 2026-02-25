<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_enqueue_scripts', 'nlc_enqueue_assets' );
add_action( 'admin_enqueue_scripts', 'nlc_enqueue_admin_assets' );

function nlc_enqueue_assets() {
    wp_enqueue_style( 'nlc-css', NLC_PLUGIN_URL . 'frontend/assets/css/widget.css', [], NLC_VERSION );
    // Chargement de Socket.io depuis le CDN officiel en HTTPS pour éviter les erreurs de protocole
    wp_enqueue_script( 'nlc-socket-io', 'https://cdn.socket.io/4.7.2/socket.io.min.js', [], '4.7.2', false );
    wp_enqueue_script( 'nlc-js', NLC_PLUGIN_URL . 'frontend/assets/js/widget.js', ['nlc-socket-io'], NLC_VERSION, true );
}

function nlc_enqueue_admin_assets( $hook ) {
    // On ne charge que sur notre page de réglages pour ne pas polluer l'admin
    if ( $hook !== 'toplevel_page_nlc-settings' ) return;
    
    nlc_enqueue_assets();
}

add_action( 'wp_footer', 'nlc_footer' );
function nlc_footer() {
    $url = get_option( 'nlc_server_url', 'http://localhost:3000' );
    $color = get_option( 'nlc_primary_color', '#00b06b' );
    
    echo '<script>var nlc_config = { server_url: "' . esc_js( $url ) . '", primary_color: "' . esc_js( $color ) . '" };</script>';
    echo '<div id="nlc-widget-container"></div>';
}
