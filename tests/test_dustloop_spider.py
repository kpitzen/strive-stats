from scraper.spiders.dustloop_spider import DustloopSpider
from tests.utils import get_test_response

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
    assert 'rows' in normal_moves, "Should have rows"
    assert len(normal_moves['rows']) > 0, "Should have at least one move"

    # Check Sol's 5P move data
    move_5p = None
    for move in normal_moves['rows']:
        if move.get('input') == '5P':
            move_5p = move
            break

    assert move_5p is not None, "Should find 5P move"
    
    # Verify all fields have correct values
    assert move_5p.get('input') == '5P', "Input should be 5P"
    assert move_5p.get('damage') == '28', "Damage should be 28"
    assert move_5p.get('guard') == 'All', "Guard should be All"
    assert move_5p.get('startup') == '4', "Startup should be 4 frames"
    assert move_5p.get('active') == '3', "Active frames should be 3"
    assert move_5p.get('recovery') == '9', "Recovery should be 9 frames"
    assert move_5p.get('on_block') == '-2', "On block should be -2"
    assert move_5p.get('on_hit') == '1', "On hit should be +1"
    assert move_5p.get('level') == '1', "Level should be 1"
    
    # Verify no RISC values in wrong columns
    assert not (move_5p.get('input', '').endswith('%')), "Input should not be a percentage"
    assert not (move_5p.get('damage', '').endswith('%')), "Damage should not be a percentage"

def test_data_alignment():
    """Test that data is correctly aligned with headers"""
    spider = DustloopSpider()
    response = get_test_response('frame_data.html')

    for item in spider.parse_frame_data(response):
        if item['table_type'] == 'normal_moves':
            for row in item['rows']:
                # Check that numeric values are in correct columns
                damage = row.get('damage', '')
                if damage and damage.replace('-', '').isdigit():
                    assert int(damage) > 0, "Damage should be positive"
                    assert int(damage) < 300, "Damage should be reasonable" 