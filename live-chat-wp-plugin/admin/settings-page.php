<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'admin_menu', 'nlc_menu' );
function nlc_menu() {
    add_menu_page( 'Nabil Live Chat', 'Live Chat', 'manage_options', 'nlc-settings', 'nlc_settings_html', 'dashicons-format-chat', 100 );
}

add_action( 'admin_init', 'nlc_init' );
function nlc_init() {
    register_setting( 'nlc_group', 'nlc_server_url' );
    register_setting( 'nlc_group', 'nlc_primary_color' );
}

function nlc_settings_html() {
    ?>
    <style>
        .nlc-card { background: #fff; border-radius: 12px; padding: 30px; margin-top: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 800px; font-family: 'Segoe UI', system-ui, sans-serif; }
        .nlc-h1 { margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
        .nlc-icon { color: #6366f1; }
        .nlc-box { background: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; border-radius: 4px; margin-bottom: 30px; }
        .nlc-box h2 { margin-top: 0; font-size: 16px; color: #475569; }
        .form-table th { font-weight: 600; color: #475569; }
        .regular-text { border-radius: 6px; border: 1px solid #cbd5e1; padding: 8px 12px; }
        .button-primary { background: #6366f1 !important; border-color: #4f46e5 !important; border-radius: 6px !important; padding: 6px 20px !important; height: auto !important; font-weight: 600 !important; }
    </style>
    <div class="wrap">
        <div class="nlc-card">
            <h1 class="nlc-h1"><span class="dashicons dashicons-format-chat nlc-icon"></span> Nabil Live Chat</h1>
            <div class="nlc-box">
                <h2>Configuration rapide</h2>
                <p>1. Lancez votre serveur Node.js.<br>2. Entrez l'URL ci-dessous.<br>3. Enregistrez pour voir le chat sur votre site.</p>
            </div>
            <form action="options.php" method="post">
                <?php settings_fields( 'nlc_group' ); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">URL WebSocket</th>
                        <td><input type="url" name="nlc_server_url" value="<?php echo esc_attr( get_option('nlc_server_url') ); ?>" class="regular-text" required /></td>
                    </tr>
                    <tr>
                        <th scope="row">Couleur Widget</th>
                        <td><input type="color" name="nlc_primary_color" value="<?php echo esc_attr( get_option('nlc_primary_color') ); ?>" /></td>
                    </tr>
                </table>
                <?php submit_button( 'Enregistrer les modifications' ); ?>
            </form>

            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                <h2 style="font-size: 18px; font-weight: 700;">Tester le Chat</h2>
                <p>Cliquez sur le bouton ci-dessous pour tester le widget sur cette page.</p>
                <button type="button" onclick="loadNlcWidget()" class="button button-secondary">Charger l'aperçu du Widget</button>
            </div>
            
            <script>
                function loadNlcWidget() {
                    // Force the container if not exists
                    if (!document.getElementById('nlc-widget-container')) {
                        const div = document.createElement('div');
                        div.id = 'nlc-widget-container';
                        document.body.appendChild(div);
                    }
                    // Scripts are already enqueued in footer if plugin is active, 
                    // but we can trigger a re-init if needed or just show the window.
                    const bubble = document.getElementById('nlc-bubble');
                    if (bubble) {
                        bubble.click();
                        alert("Le widget est déjà chargé ! Regardez en bas à droite.");
                    } else {
                        alert("Le widget n'est pas encore chargé sur cette page. Assurez-vous que l'extension est activée et rafraîchissez la page.");
                    }
                }
            </script>
        </div>
    </div>
    <?php
}
