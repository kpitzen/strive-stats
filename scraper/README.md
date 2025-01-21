# Strive Frames Scraper

A Python-based CLI tool for scraping and processing frame data from Dustloop Wiki for Guilty Gear Strive.

## Features

- Scrape frame data from Dustloop Wiki
- Download and parse HTML frame data pages
- Clean and normalize frame data using OpenAI's GPT-4
- Import data into a PostgreSQL database
- Support for incremental updates and character-specific scraping

## Prerequisites

- Python 3.12 or higher
- PostgreSQL database
- OpenAI API key (optional, for enhanced data cleaning)
- `uv` package manager

## Installation

1. Set up your Python environment:
```bash
uv sync
```

2. Copy the environment template:
```bash
cp .envrc.template .envrc
```

3. Configure your environment variables in `.envrc`:
```bash
# Database Configuration
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=frame_data

# Construct the database URL
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Optional: OpenAI API Key for enhanced data cleaning
export OPENAI_API_KEY="your-api-key"
```

## Available Commands

### Database Management

Initialize the database:
```bash
scraper-cli db-init
```

Create a new migration:
```bash
scraper-cli db-revision "description of changes"
```

Upgrade database to latest version:
```bash
scraper-cli db-upgrade
```

Downgrade database:
```bash
scraper-cli db-downgrade
```

### Data Collection

Download frame data HTML:
```bash
# Download all characters
scraper-cli scrape-data

# Download specific character
scraper-cli scrape-data --character "Sol Badguy"

# Specify custom output directory
scraper-cli scrape-data --output-dir "custom/output/path"
```

Download data from Dustloop API:
```bash
scraper-cli download-api-data [--output-dir PATH] [--batch-size NUMBER]
```

### Data Import

Import frame data to database:
```bash
# Import from default path
scraper-cli import-data

# Import from custom path
scraper-cli import-data --json-path "path/to/data.json"

# Import without truncating existing data
scraper-cli import-data --no-truncate

# Specify custom database URL
scraper-cli import-data --database-url "postgresql://user:pass@host:port/db"
```

Import API data to database:
```bash
scraper-cli import-api-data [--json-path PATH] [--database-url URL] [--no-truncate]
```

## Output Directory Structure

```
output/
├── frame_data_html/        # Raw HTML files
│   ├── sol_frame_data.html
│   └── ...
├── intermediate/           # Processed JSON files
│   ├── sol_raw.json
│   ├── sol_cleaned.json
│   └── ...
└── parsed_frame_data.json  # Final compiled data
```

## Development

### Running Tests

```bash
pytest
```

### Adding New Features

1. Add new commands in `src/scraper/cli.py`
2. Implement command logic in `src/scraper/commands/`
3. Update database models in `src/scraper/models.py`
4. Create migrations for database changes:
```bash
scraper-cli db-revision "description of changes"
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check database credentials in `.envrc`
   - Ensure database exists and is accessible

2. **OpenAI API Errors**
   - Verify API key is valid
   - Check API quota and limits
   - Ensure internet connectivity

3. **Data Parsing Errors**
   - Check HTML structure hasn't changed on Dustloop
   - Verify character names match Dustloop URLs
   - Check output directory permissions

### Debug Mode

Set environment variable for detailed logging:
```bash
export LOG_LEVEL=DEBUG
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

