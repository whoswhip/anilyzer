# Anilyzer

Anilyzer takes [GDPR data exports](https://anilist.co/settings/account) from [AniList](https://anilist.co/) and analyzes your data to give you insights such as:

> **For the most accurate results, disable [Activity Merging](https://anilist.co/settings/media) in your AniList settings.**

- Chapters read
- Estimated reading time/speed
- Reading/watching streaks (current & longest)
- And more!


<img width="1337" height="394" alt="3811Qty7tDBb2BhS9APNbci7" src="https://github.com/user-attachments/assets/efde8e95-7639-4e0e-9e2d-6aa60941e998" />



## Self-hosting

### Requirements

- [Node.js](https://nodejs.org) (v18\_ recommended)
- [Mangabaka.org database dump](https://api.mangabaka.dev/v1/database/series.sqlite.zst)

### Setup

1. Clone the repository and install dependencies:

```
git clone https://github.com/whoswhip/anilyzer.git
cd anilyzer
npm install
```

### Configuration:

Create an `.env` file with the following

```
DATABASE_URL=/path/to/series.sqlite
```

This should point to your extracted Mangabaka `.sqlite` file

### Build Anilyzer:

```
npm run build
```

### Preview production build locally:

```
npm run preview
```

For development with hot reload, use:

```
npm run dev
```
