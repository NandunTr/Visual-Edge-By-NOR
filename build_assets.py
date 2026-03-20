"""
Build optimized web assets from Works/ folder.
Creates compressed JPEG versions in assets/ for web use.
Originals are never modified.
"""
import os
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from pathlib import Path
from PIL import Image, ExifTags

BASE = Path(__file__).parent
WORKS = BASE / "Works"
ASSETS = BASE / "assets"

# Config
GALLERY_MAX = 1200  # max dimension for gallery images
THUMB_MAX = 600     # max dimension for thumbnails
JPEG_QUALITY = 82

CATEGORIES = {
    "photography": WORKS / "Pics" / "photography",
    "designs": WORKS / "Pics" / "Designs",
    "logos": WORKS / "Pics" / "LOGOS",
}

def fix_orientation(img):
    """Apply EXIF orientation if present."""
    try:
        exif = img._getexif()
        if exif:
            for tag, value in exif.items():
                if ExifTags.TAGS.get(tag) == "Orientation":
                    if value == 3:
                        img = img.rotate(180, expand=True)
                    elif value == 6:
                        img = img.rotate(270, expand=True)
                    elif value == 8:
                        img = img.rotate(90, expand=True)
                    break
    except Exception:
        pass
    return img

def resize_and_save(src: Path, dst: Path, max_dim: int):
    """Resize image keeping aspect ratio and save as JPEG."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    # Change extension to .jpg
    dst = dst.with_suffix(".jpg")
    if dst.exists():
        return dst
    try:
        img = Image.open(src)
        img = fix_orientation(img)
        if img.mode in ("RGBA", "P"):
            bg = Image.new("RGB", img.size, (0, 0, 0))
            if img.mode == "P":
                img = img.convert("RGBA")
            bg.paste(img, mask=img.split()[3])
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")
        
        # Resize
        ratio = min(max_dim / img.width, max_dim / img.height)
        if ratio < 1:
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
        
        img.save(dst, "JPEG", quality=JPEG_QUALITY, optimize=True)
        src_kb = src.stat().st_size // 1024
        dst_kb = dst.stat().st_size // 1024
        print(f"  {src.name} ({src_kb}KB) -> {dst.name} ({dst_kb}KB)")
        return dst
    except Exception as e:
        print(f"  ERROR: {src.name}: {e}")
        return None

def generate_video_poster(video_path: Path, poster_path: Path):
    """Create a placeholder poster for videos."""
    poster_path.parent.mkdir(parents=True, exist_ok=True)
    if poster_path.exists():
        return
    # Create a simple dark poster with gold accent
    img = Image.new("RGB", (1280, 720), (15, 15, 15))
    img.save(poster_path, "JPEG", quality=85)
    print(f"  Video poster: {poster_path.name}")

def main():
    print("=== Building Web Assets ===\n")
    
    for cat_name, src_dir in CATEGORIES.items():
        if not src_dir.exists():
            print(f"SKIP: {src_dir} not found")
            continue
        
        print(f"\n[{cat_name.upper()}]")
        gallery_dir = ASSETS / cat_name
        thumb_dir = ASSETS / cat_name / "thumbs"
        
        for f in sorted(src_dir.iterdir()):
            if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
                # Gallery size
                resize_and_save(f, gallery_dir / f.stem, GALLERY_MAX)
                # Thumbnail
                resize_and_save(f, thumb_dir / f.stem, THUMB_MAX)
    
    # Video posters
    print("\n[VIDEO POSTERS]")
    vid_dir = WORKS / "Videos"
    wed_dir = WORKS / "Wedding videos"
    
    for vdir, cat in [(vid_dir, "videography"), (wed_dir, "weddings")]:
        if vdir.exists():
            poster_dir = ASSETS / cat
            poster_dir.mkdir(parents=True, exist_ok=True)
            for f in sorted(vdir.iterdir()):
                if f.suffix.lower() in (".mp4", ".mov", ".avi"):
                    generate_video_poster(f, poster_dir / (f.stem + "_poster.jpg"))
    
    print("\n=== Done! ===")

if __name__ == "__main__":
    main()
