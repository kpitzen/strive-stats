from typing import Any, Dict
import json
from pathlib import Path

class DustloopPipeline:
    def __init__(self) -> None:
        self.tables: list[dict[str, Any]] = []
        
    def process_item(self, item: Dict[str, Any], spider: Any) -> Dict[str, Any]:
        self.tables.append(dict(item))
        return item
    
    def close_spider(self, spider: Any) -> None:
        # Create output directory if it doesn't exist
        output_dir = Path('output')
        output_dir.mkdir(exist_ok=True)
        
        # Save all tables to a JSON file
        with open(output_dir / 'dustloop_tables.json', 'w', encoding='utf-8') as f:
            json.dump(self.tables, f, indent=2, ensure_ascii=False) 