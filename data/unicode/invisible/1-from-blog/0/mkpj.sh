#/bin/bash
python3 -m venv .venv
source .venv/bin/activate
pip install requests beautifulsoup4
python build_invisible_list.py
