<?php
/**
 * Enqueue assets.
 *
 * Handles loading of editor and frontend scripts/styles.
 *
 * @package PriorityPlusNavigation
 */

namespace PriorityPlusNavigation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Enqueues
 *
 * This class is responsible for enqueueing scripts and styles for the plugin.
 *
 * @package PriorityPlusNavigation
 */
class Enqueues extends Plugin_Module {

	/**
	 * Path resolver for build directory.
	 *
	 * @var Plugin_Paths
	 */
	private Plugin_Paths $build_dir;

	/**
	 * Track if we've enqueued the frontend assets (to avoid duplicates).
	 *
	 * @var bool
	 */
	private bool $frontend_assets_enqueued = false;

	/**
	 * Setup the class.
	 *
	 * @param string $build_path Absolute path to the build directory for all assets.
	 */
	public function __construct( string $build_path ) {
		$this->build_dir = new Plugin_Paths( $build_path );
	}

	/**
	 * Initialize the module.
	 */
	public function init() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
	}

	/**
	 * Enqueue editor assets for Priority Plus Navigation extension.
	 * Loads JS that extends core/navigation with Priority+ functionality.
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		$asset_script = $this->build_dir->get_asset_meta( 'priority-plus-nav-editor.js' );
		$asset_style  = $this->build_dir->get_path( 'priority-plus-nav-editor.css' );

		if ( ! $asset_script ) {
			return;
		}

		wp_enqueue_script(
			'priority-plus-nav-editor',
			$this->build_dir->get_url( 'priority-plus-nav-editor.js' ),
			$asset_script['dependencies'],
			$asset_script['version'],
			true
		);

		if ( file_exists( $asset_style ) ) {
			wp_enqueue_style(
				'priority-plus-nav-editor-style',
				$this->build_dir->get_url( 'priority-plus-nav-editor.css' ),
				array(),
				$asset_script['version']
			);
		}
	}

	/**
	 * Enqueue Priority+ frontend script and styles (only once).
	 * Called from Block_Renderer when a Priority+ block is rendered.
	 *
	 * @return void
	 */
	public function enqueue_frontend_assets(): void {
		if ( $this->frontend_assets_enqueued ) {
			return;
		}

		$asset_meta = $this->build_dir->get_asset_meta( 'priority-plus-navigation.js' );
		if ( ! $asset_meta ) {
			return;
		}

		$this->frontend_assets_enqueued = true;

		wp_enqueue_script(
			'priority-plus-navigation',
			$this->build_dir->get_url( 'priority-plus-navigation.js' ),
			$asset_meta['dependencies'],
			$asset_meta['version'],
			true
		);

		$style_path = $this->build_dir->get_path( 'style-priority-plus-navigation.css' );
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'priority-plus-navigation',
				$this->build_dir->get_url( 'style-priority-plus-navigation.css' ),
				array(),
				$asset_meta['version']
			);
		}
	}
}
