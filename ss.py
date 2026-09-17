import shutil
from pathlib import Path

# Windows folder accessed from WSL
source = Path("/mnt/c/Users/LENOVO/Downloads/IM")

# Destination in WSL home directory
destination = Path.home() / "ss"

# Create destination if it doesn't exist
destination.mkdir(parents=True, exist_ok=True)

# Supported image formats
image_extensions = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".tiff",
    ".tif",
    ".svg",
    ".ico",
}

moved = 0

for file in source.iterdir():
    if file.is_file() and file.suffix.lower() in image_extensions:
        target = destination / file.name

        # Don't overwrite existing files
        if target.exists():
            print(f"Skipped: {file.name} (already exists)")
            continue

        shutil.move(str(file), str(target))
        print(f"Moved: {file.name}")
        moved += 1

print(f"\nDone — moved {moved} image(s).")
print(f"Destination: {destination}")
