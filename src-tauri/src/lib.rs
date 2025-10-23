mod opl;
mod scanner;
mod naming;
mod covers;
mod cheats;
mod iso;
mod vmc;
mod organizer;
mod metadata;
mod exporter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let _ = dotenvy::dotenv();
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .invoke_handler(tauri::generate_handler![
      opl::suggest_opl_roots,
      opl::validate_opl_dir,
      opl::fix_opl_structure,
      scanner::scan_opl_games,
      scanner::scan_folder_games,
      scanner::validate_library_folder,
      scanner::validate_generic_folder,
      scanner::check_writeable_folder,
      naming::preview_renames,
      naming::apply_renames,
      covers::save_cover_from_url,
      covers::save_cover_from_file,
      covers::delete_cover,
      cheats::load_cht,
      cheats::save_cht,
      cheats::import_cht,
      cheats::export_cht,
      vmc::list_vmcs,
      vmc::import_vmc,
      vmc::export_vmc,
      vmc::delete_vmc,
      organizer::preview_organize,
      organizer::apply_organize,
      metadata::auto_fetch_cover,
      exporter::export_catalog_json
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
