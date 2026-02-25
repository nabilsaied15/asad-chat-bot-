<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_enqueue_scripts', 'nlc_enqueue_assets' );
function nlc_enqueue_assets() {
    $url = get_option( 'nlc_server_url', 'http://localhost:3000' );
    wp_enqueue_style( 'nlc-css', NLC_PLUGIN_URL . 'frontend/assets/css/widget.css', [], NLC_VERSION );
    wp_enqueue_script( 'nlc-socket-io', esc_url( rtrim( $url, '/' ) ) . '/socket.io/socket.io.js', [], null, true );
    wp_enqueue_script( 'nlc-js', NLC_PLUGIN_URL . 'frontend/assets/js/widget.js', ['nlc-socket-io'], NLC_VERSION, true );
}

add_action( 'wp_footer', 'nlc_footer' );
function nlc_footer() {
    $url = get_option( 'nlc_server_url', 'http://localhost:3000' );
    $color = get_option( 'nlc_primary_color', '#00b06b' );
    
    echo '<script>var nlc_config = { server_url: "' . esc_js( $url ) . '", primary_color: "' . esc_js( $color ) . '" };</script>';
    echo '<div id="nlc-widget-container"></div>';
}
