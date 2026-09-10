import sys
from pathlib import Path

# Ensure both project root and backend dir are in sys.path
_current_dir = Path(__file__).resolve().parent
_parent_dir = _current_dir.parent

for _p in [str(_current_dir), str(_parent_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)
