use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;
use regex::Regex;

const SECTOR_SIZE: u64 = 2048;

fn read_sector(f: &mut File, lba: u32, buf: &mut [u8]) -> std::io::Result<usize> {
  f.seek(SeekFrom::Start(lba as u64 * SECTOR_SIZE))?;
  f.read(buf)
}

fn le_u32(b: &[u8]) -> u32 { u32::from_le_bytes([b[0], b[1], b[2], b[3]]) }

struct DirRecord {
  extent_lba: u32,
  data_len: u32,
  flags: u8,
  name: String,
}

fn parse_dir_records(buf: &[u8]) -> Vec<DirRecord> {
  let mut res = Vec::new();
  let mut off = 0usize;
  while off < buf.len() {
    let len = buf[off] as usize;
    if len == 0 {
      let next = ((off / (SECTOR_SIZE as usize)) + 1) * (SECTOR_SIZE as usize);
      if next <= off { break; }
      off = next;
      continue;
    }
    if off + len > buf.len() { break; }
    let s = &buf[off..off + len];
    if s.len() < 34 { break; }
    let extent_lba = le_u32(&s[2..6]);
    let data_len = le_u32(&s[10..14]);
    let flags = s[25];
    let name_len = s[32] as usize;
    let name_start = 33;
    if name_start + name_len > s.len() { break; }
    let raw_name = &s[name_start..name_start + name_len];
    let mut name = String::from_utf8_lossy(raw_name).to_string();
    if let Some(pos) = name.find(';') { name.truncate(pos); }
    res.push(DirRecord { extent_lba, data_len, flags, name });
    off += len;
  }
  res
}

fn read_pvd_root(f: &mut File) -> std::io::Result<(u32, u32)> {
  let mut buf = vec![0u8; SECTOR_SIZE as usize];
  read_sector(f, 16, &mut buf)?;
  if &buf[1..6] != b"CD001" { return Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "not iso9660")); }
  let root_rec = &buf[156..];
  let len = root_rec[0] as usize;
  let rr = &root_rec[..len];
  let lba = le_u32(&rr[2..6]);
  let size = le_u32(&rr[10..14]);
  Ok((lba, size))
}

pub fn read_system_cnf_id(path: &Path) -> Option<String> {
  let mut f = File::open(path).ok()?;
  let (root_lba, root_len) = read_pvd_root(&mut f).ok()?;
  let mut dir_buf = vec![0u8; root_len as usize];
  f.seek(SeekFrom::Start(root_lba as u64 * SECTOR_SIZE)).ok()?;
  f.read_exact(&mut dir_buf).ok()?;
  let entries = parse_dir_records(&dir_buf);
  for e in entries {
    if (e.flags & 0x02) != 0 { continue; }
    if e.name.eq_ignore_ascii_case("SYSTEM.CNF") {
      let mut file_buf = vec![0u8; e.data_len as usize];
      f.seek(SeekFrom::Start(e.extent_lba as u64 * SECTOR_SIZE)).ok()?;
      f.read_exact(&mut file_buf).ok()?;
      let txt = String::from_utf8_lossy(&file_buf);
      // Prefer direct ID pattern anywhere in SYSTEM.CNF
      if let Ok(id_re) = Regex::new(r"(?i)([A-Z]{4}_[0-9]{3}\.[0-9]{2})") {
        if let Some(cap) = id_re.captures(&txt) {
          return Some(cap.get(1)?.as_str().to_uppercase());
        }
      }
      // Fallback: parse BOOT line then extract ID from that path
      if let Ok(boot_re) = Regex::new(r"(?i)BOOT2?\s*=\s*cdrom0:\\([^;\r\n]+)") {
        if let Some(cap) = boot_re.captures(&txt) {
          let raw = cap.get(1)?.as_str().trim();
          if let Ok(id_re) = Regex::new(r"(?i)([A-Z]{4}_[0-9]{3}\.[0-9]{2})") {
            if let Some(idcap) = id_re.captures(raw) {
              return Some(idcap.get(1)?.as_str().to_uppercase());
            }
          }
        }
      }
    }
  }
  None
}
