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
mod remote;
mod file_validator;
mod security;
mod duplicates;
mod backup;
mod converter;
mod cdda;
mod transfer;
mod game_metadata;

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
      opl::initialize_opl_structure,
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
      cheats::validate_cht_content,
      cheats::get_cht_help,
      vmc::list_vmcs,
      vmc::import_vmc,
      vmc::export_vmc,
      vmc::delete_vmc,
      organizer::preview_organize,
      organizer::apply_organize,
      metadata::auto_fetch_cover,
      metadata::batch_fetch_covers,
      metadata::get_cover_stats,
      metadata::verify_cover_file,
      exporter::export_catalog_json,
      remote::fetch_archive_org_games,
      remote::download_remote_iso,
      remote::download_remote_iso_with_progress,
      remote::validate_remote_source,
      remote::get_security_info,
      duplicates::find_duplicate_games,
      duplicates::get_duplicate_stats,
      backup::create_backup,
      backup::save_backup_to_file,
      backup::load_backup_from_file,
      backup::validate_backup,
      backup::get_backup_info,
      converter::convert_bin_to_iso,
      converter::get_conversion_info,
      cdda::detect_cdda,
      transfer::copy_iso_to_opl,
      transfer::delete_iso_from_opl,
      transfer::is_iso_present,
      game_metadata::fetch_game_metadata,
      game_metadata::batch_fetch_metadata,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
