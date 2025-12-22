# Anilyzer

Anilyzer takes [GDPR data exports](https://anilist.co/settings/account) from [AniList](https://anilist.co/) and analyzes your data to give you insights such as:

> **For the most accurate results, disable [Activity Merging](https://anilist.co/settings/media) in your AniList settings.**

- Chapters read
- Estimated reading time/speed
- Reading/watching streaks (current & longest)
- And more!

<img width="1337" height="394" alt="3811Qty7tDBb2BhS9APNbci7" src="https://github.com/user-attachments/assets/efde8e95-7639-4e0e-9e2d-6aa60941e998" />

#### Data Exporters

GDPR data exports are not the only way to get your data, you can also use separate programs to export your data into a compatible format for Anilyzer such as the following:

- [anilyzer-data-export](https://github.com/whoswhip/anilyzer-data-exporter)

## Self-hosting

### Requirements

- [Node.js](https://nodejs.org) (v18\_ recommended)
- [Mangabaka.org database dump](https://api.mangabaka.dev/v1/database/series.sqlite.zst)

### Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/whoswhip/anilyzer.git
cd anilyzer
npm install
```

2. Create indexes on database (optional)
   Creating indexes on the database will **greatly** increase lookup speeds.

**Option A: Run the script**

```bash
npx ts-node ./scripts/create_indexes.ts
```

**Option B: Do it manually**

1. Open your database client.
2. Run the following SQL:

```sql
CREATE INDEX IF NOT EXISTS active_source_anilist_id_idx ON series(source_anilist_id, state);
```

### Configuration:

Create an `.env` file with the following

```ini
DATABASE_URL=/path/to/series.sqlite
```

This should point to your extracted Mangabaka `.sqlite` file

#### Personal Use or Development

1. Clone and set up the project (as described above).
2. Start the dev server:
   ```bash
   npm run dev
   ```
   Access the website at `https://localhost:5173/` (or the link shown).
3. Or preview the production build locally:
   ```bash
   npm run build
   npm run preview
   ```

#### For Production/Public Hosting

If you want to make Anilyzer **publically accessible**, follow these steps:

1. Build for production:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   node build/index.js
   ```
