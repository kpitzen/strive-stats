import os
from scrapy.http import TextResponse, Request
from scraper.spiders.dustloop_spider import DustloopSpider

def get_test_response(filename):
    """Helper to load test data from file"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(current_dir, '..', filename), 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create a fake response
    url = 'https://www.dustloop.com/w/GGST/Sol_Badguy/Frame_Data'
    request = Request(url=url)
    response = TextResponse(url=url, body=content.encode('utf-8'), encoding='utf-8', request=request)
    return response

def test_table_type_detection():
    """Test that tables are correctly categorized by section"""
    spider = DustloopSpider()
    response = get_test_response('frame_data.html')
    
    # Process the response
    tables_found = {
        'normal_moves': 0,
        'special_moves': 0,
        'overdrive_moves': 0,
        'character_specific': 0,
        'system_core': 0,
        'system_jump': 0
    }
    
    # Collect all tables and their types
    for item in spider.parse_frame_data(response):
        table_type = item['table_type']
        tables_found[table_type] = tables_found.get(table_type, 0) + 1
    
    # Verify we found the expected tables
    assert tables_found['normal_moves'] > 0, "Should find normal moves tables"
    assert tables_found['special_moves'] > 0, "Should find special moves tables"
    assert tables_found['overdrive_moves'] > 0, "Should find overdrive moves tables"

def test_normal_moves_parsing():
    """Test that normal moves are correctly parsed"""
    spider = DustloopSpider()
    response = get_test_response('frame_data.html')
    
    # Find a normal moves table
    normal_moves = None
    for item in spider.parse_frame_data(response):
        if item['table_type'] == 'normal_moves':
            normal_moves = item
            break
    
    assert normal_moves is not None, "Should find normal moves table"
    
    # Verify the structure
    assert 'rows' in normal_moves, "Should have rows"
    assert len(normal_moves['rows']) > 0, "Should have at least one move"
    
    # Check a specific move (5P) to verify parsing
    move_5p = None
    for move in normal_moves['rows']:
        if move['input'] == '5P':
            move_5p = move
            break
    
    assert move_5p is not None, "Should find 5P move"
    assert 'damage' in move_5p, "Should have damage"
    assert 'guard' in move_5p, "Should have guard"
    assert 'startup' in move_5p, "Should have startup"
    assert 'active' in move_5p, "Should have active frames"
    assert 'recovery' in move_5p, "Should have recovery"
    assert 'on_block' in move_5p, "Should have on_block"
    assert 'on_hit' in move_5p, "Should have on_hit"
    
    # Verify no RISC values in wrong columns
    assert not move_5p['input'].endswith('%'), "Input should not be a percentage"
    assert not move_5p['damage'].endswith('%'), "Damage should not be a percentage"
    assert not move_5p['guard'].endswith('%'), "Guard should not be a percentage"

def test_special_moves_parsing():
    """Test that special moves are correctly parsed"""
    spider = DustloopSpider()
    response = get_test_response('frame_data.html')
    
    # Find a special moves table
    special_moves = None
    for item in spider.parse_frame_data(response):
        if item['table_type'] == 'special_moves':
            special_moves = item
            break
    
    assert special_moves is not None, "Should find special moves table"
    
    # Verify the structure
    assert 'rows' in special_moves, "Should have rows"
    assert len(special_moves['rows']) > 0, "Should have at least one move"
    
    # Check that each special move has required fields
    for move in special_moves['rows']:
        assert 'name' in move, "Should have name"
        assert 'input' in move, "Should have input"
        assert 'damage' in move, "Should have damage"
        assert 'guard' in move, "Should have guard"
        assert 'startup' in move, "Should have startup"
        assert 'active' in move, "Should have active frames"
        assert 'recovery' in move, "Should have recovery"
        assert 'on_block' in move, "Should have on_block"
        assert 'on_hit' in move, "Should have on_hit"

def test_data_alignment():
    """Test that data is correctly aligned with headers"""
    spider = DustloopSpider()
    response = get_test_response('frame_data.html')
    
    for item in spider.parse_frame_data(response):
        if item['table_type'] == 'normal_moves':
            for row in item['rows']:
                # Check that numeric values are in correct columns
                if row['damage'].replace('-', '').isdigit():
                    assert not row['input'].isdigit(), f"Input '{row['input']}' should not be numeric when damage '{row['damage']}' is numeric"
                
                # Check that RISC values are in correct columns
                if any(v.endswith('%') for v in [row['risc_gain'], row['risc_loss']]):
                    assert not any(v.endswith('%') for v in [row['input'], row['damage'], row['guard']]), \
                        f"Found percentage in wrong column: {row}" 